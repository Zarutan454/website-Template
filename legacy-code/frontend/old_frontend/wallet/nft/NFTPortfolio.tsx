import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export const NFTPortfolio = () => {
  return (
    <Card className="bg-primary-600 bg-left-bottom bg-no-repeat bg-contain mb-[25px] p-[20px] md:p-[25px] rounded-md" 
          style={{backgroundImage: "url(/src/assets/images/portfolio-bg.jpg)"}}>
      <div className="mb-[20px] md:mb-[25px] flex items-center justify-between">
        <h5 className="mb-0 text-white">NFT Portfolio</h5>
      </div>
      
      <div className="relative z-[1] md:mt-[29px]">
        <div className="flex items-center mb-[20px] md:mb-[28px]">
          <img src="/src/assets/images/icons/total-balance.svg" alt="total-balance" />
          <div className="ltr:ml-[10px] rtl:mr-[10px]">
            <span className="block uppercase text-white">Total Value</span>
            <h4 className="mb-0 text-white font-semibold mt-[6px] text-[18px] md:text-[20px]">
              245.85 ETH
              <span className="font-medium relative text-base ltr:ml-[3px] rtl:mr-[3px] ltr:pl-[25px] rtl:pr-[25px] text-success-100">
                <TrendingUp className="absolute !text-[20px] ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2" />
                +3.5%
              </span>
            </h4>
          </div>
        </div>

        <div className="table-responsive overflow-x-auto">
          <table className="w-full">
            <thead className="text-white">
              <tr>
                <th className="font-medium text-xs text-left px-[14px] pb-[7px] whitespace-nowrap first:pl-0">Collection</th>
                <th className="font-medium text-xs text-center px-[14px] pb-[7px] whitespace-nowrap">Floor Price</th>
                <th className="font-medium text-xs text-right px-[14px] pb-[7px] whitespace-nowrap last:pr-0">Holdings</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {portfolioData.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium text-left whitespace-nowrap px-[14px] first:pl-0 py-[10px] border-b !border-primary-400">
                    {item.collection} <span className="text-xs font-normal">({item.items} items)</span>
                  </td>
                  <td className="font-medium text-center whitespace-nowrap px-[14px] py-[10px] border-b !border-primary-400">
                    {item.floorPrice} ETH
                  </td>
                  <td className="font-medium text-right whitespace-nowrap px-[14px] last:pr-0 py-[10px] border-b !border-primary-400">
                    {item.value} ETH
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-right">
          <a href="#" className="inline-block px-[12px] py-[4px] rounded-md text-white font-medium border border-primary-400 transition-all hover:bg-primary-400 mt-[20px] md:mt-[28px]">
            <span className="inline-block relative pr-[17px]">
              View All NFTs
              <i className="ri-arrow-right-s-line absolute -right-[6px] text-[20px] top-1/2 -translate-y-1/2"></i>
            </span>
          </a>
        </div>

        <div className="absolute right-0 -top-[55px] -z-[1] hidden md:block">
          <img src="/src/assets/images/sphere-bowl.png" alt="sphere-bowl" />
        </div>
      </div>
    </Card>
  );
};

const portfolioData = [
  { id: 1, collection: 'Bored Ape Yacht Club', items: 2, floorPrice: '80.5', value: '161.0' },
  { id: 2, collection: 'CryptoPunks', items: 1, floorPrice: '120.3', value: '120.3' },
  { id: 3, collection: 'Doodles', items: 3, floorPrice: '15.75', value: '47.25' },
  { id: 4, collection: 'Azuki', items: 2, floorPrice: '25.8', value: '51.6' },
  { id: 5, collection: 'CloneX', items: 1, floorPrice: '18.5', value: '18.5' }
];