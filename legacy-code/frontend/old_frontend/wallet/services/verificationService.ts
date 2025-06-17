import { supabase } from '@/integrations/supabase/client';
import { ethers } from 'ethers';

export const verifyContract = async (
  contractAddress: string,
  network: string,
  constructorArgs: any[],
  contractName: string = 'CustomToken',
  compilerVersion: string = 'v0.8.24+commit.e11b9ed9'
) => {
  try {
    console.log('Starting contract verification:', {
      contractAddress,
      network,
      constructorArgs
    });

    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error('Authentication required');

    // Properly encode constructor arguments using ethers
    const abiCoder = new ethers.AbiCoder();
    const types = ['string', 'string', 'uint256', 'address', 'bool', 'bool'];
    
    // Ensure all arguments are present and in correct format
    const processedArgs = [
      constructorArgs[0], // name (string)
      constructorArgs[1], // symbol (string)
      ethers.parseUnits(constructorArgs[2].toString(), 18), // initialSupply (uint256)
      constructorArgs[3] || ethers.ZeroAddress, // initialOwner (address)
      constructorArgs[4] || false, // canMint (bool)
      constructorArgs[5] || false  // canBurn (bool)
    ];

    console.log('Processing arguments:', {
      types,
      processedArgs
    });

    // Encode the constructor arguments
    const encodedArgs = abiCoder.encode(types, processedArgs).slice(2); // remove '0x' prefix

    console.log('Encoded constructor arguments:', encodedArgs);

    // First, get the token UUID using the contract address
    const { data: tokenData, error: tokenError } = await supabase
      .from('tokens')
      .select('id, creator_id')
      .eq('contract_address', contractAddress)
      .maybeSingle();

    if (tokenError) {
      console.error('Error fetching token:', tokenError);
      throw new Error('Error fetching token data');
    }

    if (!tokenData) {
      throw new Error('Token not found in database');
    }

    if (tokenData.creator_id !== user?.id) {
      throw new Error('Unauthorized: You do not own this token');
    }

    const { data, error } = await supabase.functions.invoke('verify-contract', {
      body: {
        contractAddress,
        network,
        constructorArgs: encodedArgs,
        contractName,
        compilerVersion
      }
    });

    if (error) throw error;

    if (data.success) {
      // Update verification status using the token UUID
      const { error: updateError } = await supabase
        .from('token_verification_status')
        .upsert({
          token_id: tokenData.id,
          verification_status: 'verified',
          verification_date: new Date().toISOString(),
          explorer_url: `${network === 'ethereum' ? 'https://etherscan.io' : 'https://holesky.etherscan.io'}/address/${contractAddress}#code`
        });

      if (updateError) {
        console.error('Error updating verification status:', updateError);
        throw updateError;
      }

      return {
        success: true,
        message: 'Contract verified successfully'
      };
    } else {
      throw new Error(data.error || 'Verification failed');
    }
  } catch (error) {
    console.error('Contract verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const checkVerificationStatus = async (contractAddress: string) => {
  try {
    // Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error('Authentication required');

    // First get the token UUID
    const { data: tokenData, error: tokenError } = await supabase
      .from('tokens')
      .select('id')
      .eq('contract_address', contractAddress)
      .maybeSingle();

    if (tokenError) throw tokenError;

    if (!tokenData) {
      throw new Error('Token not found');
    }

    // Then query verification status using the UUID
    const { data, error } = await supabase
      .from('token_verification_status')
      .select('*')
      .eq('token_id', tokenData.id)
      .maybeSingle();

    if (error) throw error;

    return {
      success: true,
      status: data?.verification_status || 'unverified',
      explorerUrl: data?.explorer_url
    };
  } catch (error) {
    console.error('Error checking verification status:', error);
    return {
      success: false,
      error: error.message
    };
  }
};