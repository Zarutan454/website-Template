import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Globe, Twitter, Github, Linkedin, Facebook, Instagram, Loader2, Check, AlertCircle, Edit3, X, User, Info } from 'lucide-react';
import { API_PROFILE_ABOUT } from '@/config/api';

interface ProfileAboutSectionProps {
  profile: {
    bio?: string;
    occupation?: string;
    company?: string;
    interests?: string[];
    skills?: string[];
    social_media_links?: Record<string, string>;
    id?: number | string;
    username?: string;
  };
  isLoading?: boolean;
}

const SOCIAL_PLATFORMS = [
  { key: 'website', label: 'Website', icon: Globe },
  { key: 'twitter', label: 'Twitter', icon: Twitter },
  { key: 'github', label: 'GitHub', icon: Github },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'facebook', label: 'Facebook', icon: Facebook },
  { key: 'instagram', label: 'Instagram', icon: Instagram },
];

const MAX_BIO = 500;
const MAX_OCCUPATION = 100;
const MAX_COMPANY = 100;
const MAX_INTERESTS = 10;
const MAX_SKILLS = 15;

// Debounce utility function
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Tooltip Component
const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => (
  <div className="group relative inline-block">
    {children}
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
      {content}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

// Skeleton Loading Component
const SkeletonLoader = () => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-dark-100 rounded-lg p-4">
      <div className="h-5 bg-gray-700 rounded w-24 mb-3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      </div>
    </div>
    <div className="bg-dark-100 rounded-lg p-4">
      <div className="h-5 bg-gray-700 rounded w-16 mb-3"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
    </div>
    <div className="bg-dark-100 rounded-lg p-4">
      <div className="h-5 bg-gray-700 rounded w-20 mb-3"></div>
      <div className="flex flex-wrap gap-2">
        <div className="h-6 bg-gray-700 rounded-full w-16"></div>
        <div className="h-6 bg-gray-700 rounded-full w-20"></div>
        <div className="h-6 bg-gray-700 rounded-full w-14"></div>
      </div>
    </div>
  </div>
);

const ProfileAboutSection: React.FC<ProfileAboutSectionProps> = ({ profile, isLoading = false }) => {
  const { user } = useAuth();
  const isOwnProfile = user && (user.id === profile.id || user.username === profile.username);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    bio: profile.bio || '',
    occupation: profile.occupation || '',
    company: profile.company || '',
    interests: (profile.interests || []).join(', '),
    skills: (profile.skills || []).join(', '),
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState(() => {
    const links = profile.social_media_links || {};
    return SOCIAL_PLATFORMS.map(p => ({
      platform: p.key,
      url: links[p.key] || '',
    }));
  });

  const [fieldErrors, setFieldErrors] = useState({
    bio: '',
    occupation: '',
    company: '',
    interests: '',
    skills: '',
    social_links: {} as Record<string, string>,
  });

  // Memoized validation function
  const validateFields = useCallback(() => {
    const errors: Omit<typeof fieldErrors, 'social_links'> = { 
      bio: '', 
      occupation: '', 
      company: '', 
      interests: '', 
      skills: '' 
    };
    
    // Bio ist optional, aber wenn vorhanden, dann Länge prüfen
    if (form.bio.length > MAX_BIO) {
      errors.bio = `Maximal ${MAX_BIO} Zeichen erlaubt (${form.bio.length}/${MAX_BIO})`;
    }
    
    if (form.occupation.length > MAX_OCCUPATION) {
      errors.occupation = `Maximal ${MAX_OCCUPATION} Zeichen erlaubt (${form.occupation.length}/${MAX_OCCUPATION})`;
    }
    
    if (form.company.length > MAX_COMPANY) {
      errors.company = `Maximal ${MAX_COMPANY} Zeichen erlaubt (${form.company.length}/${MAX_COMPANY})`;
    }

    // Interessen validieren
    const interests = form.interests.split(',').map(s => s.trim()).filter(Boolean);
    if (interests.length > MAX_INTERESTS) {
      errors.interests = `Maximal ${MAX_INTERESTS} Interessen erlaubt (${interests.length}/${MAX_INTERESTS})`;
    }

    // Skills validieren
    const skills = form.skills.split(',').map(s => s.trim()).filter(Boolean);
    if (skills.length > MAX_SKILLS) {
      errors.skills = `Maximal ${MAX_SKILLS} Skills erlaubt (${skills.length}/${MAX_SKILLS})`;
    }

    return errors;
  }, [form]);

  // Debounced validation
  const debouncedValidation = useMemo(
    () => debounce((errors: any) => {
      setFieldErrors(prev => ({ ...prev, ...errors }));
    }, 300),
    []
  );

  // Echtzeit-Validierung beim Tippen (debounced)
  useEffect(() => {
    if (editMode) {
      const errors = validateFields();
      debouncedValidation(errors);
    }
  }, [form, editMode, validateFields, debouncedValidation]);

  // Auto-Hide Success Message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Update form when profile changes
  useEffect(() => {
    if (!editMode) {
      setForm({
        bio: profile.bio || '',
        occupation: profile.occupation || '',
        company: profile.company || '',
        interests: (profile.interests || []).join(', '),
        skills: (profile.skills || []).join(', '),
      });
      setSocialLinks(() => {
        const links = profile.social_media_links || {};
        return SOCIAL_PLATFORMS.map(p => ({
          platform: p.key,
          url: links[p.key] || '',
        }));
      });
    }
  }, [profile, editMode]);

  const validateSocialLinks = useCallback(() => {
    const errors: Record<string, string> = {};
    socialLinks.forEach(link => {
      if (link.url && !validateUrl(link.url)) {
        errors[link.platform] = 'Ungültige URL - muss mit http:// oder https:// beginnen';
      }
    });
    return errors;
  }, [socialLinks]);

  const validateUrl = useCallback((url: string): boolean => {
    if (!url) return true;
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }, []);

  const hasErrors = useCallback(() => {
    const fieldErrors = validateFields();
    const socialErrors = validateSocialLinks();
    return Object.values(fieldErrors).some(Boolean) || Object.values(socialErrors).some(Boolean);
  }, [validateFields, validateSocialLinks]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSocialLinkChange = useCallback((idx: number, value: string) => {
    setSocialLinks(links => links.map((l, i) => i === idx ? { ...l, url: value } : l));
  }, []);

  const handleSave = useCallback(async () => {
    const fieldValidationErrors = validateFields();
    const socialValidationErrors = validateSocialLinks();
    
    setFieldErrors(prev => ({ 
      ...prev, 
      ...fieldValidationErrors,
      social_links: socialValidationErrors 
    }));
    
    if (Object.values(fieldValidationErrors).some(Boolean) || Object.values(socialValidationErrors).some(Boolean)) {
      setError('Bitte korrigiere die Fehler vor dem Speichern');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Bereite die Daten für das Backend vor
      const requestData = {
        bio: form.bio.trim(),
        occupation: form.occupation.trim(),
        company: form.company.trim(),
        interests: form.interests.split(',').map(s => s.trim()).filter(Boolean),
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        social_media_links: Object.fromEntries(
          socialLinks.filter(l => l.url.trim()).map(l => [l.platform, l.url.trim()])
        ),
      };

      console.log('Sending profile data:', requestData);

      // Verwende die absolute Backend-URL direkt
      const res = await fetch('http://localhost:8000/api/auth/profile/about/', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.detail || errorData.message || `HTTP ${res.status}: Fehler beim Speichern`);
      }
      
      const responseData = await res.json();
      console.log('Success response:', responseData);
      
      setSuccess(true);
      setEditMode(false);
      
      // Aktualisiere die lokalen Daten
      setForm({
        bio: responseData.bio || '',
        occupation: responseData.occupation || '',
        company: responseData.company || '',
        interests: (responseData.interests || []).join(', '),
        skills: (responseData.skills || []).join(', '),
      });
      
      setSocialLinks(() => {
        const links = responseData.social_media_links || {};
        return SOCIAL_PLATFORMS.map(p => ({
          platform: p.key,
          url: links[p.key] || '',
        }));
      });
      
      // Seite neu laden nach kurzer Verzögerung für bessere UX
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error('Save error:', err);
      setError(err.message || 'Unbekannter Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  }, [form, socialLinks, validateFields, validateSocialLinks]);

  const handleCancel = useCallback(() => {
    setEditMode(false);
    setForm({
      bio: profile.bio || '',
      occupation: profile.occupation || '',
      company: profile.company || '',
      interests: (profile.interests || []).join(', '),
      skills: (profile.skills || []).join(', '),
    });
    setSocialLinks(() => {
      const links = profile.social_media_links || {};
      return SOCIAL_PLATFORMS.map(p => ({
        platform: p.key,
        url: links[p.key] || '',
      }));
    });
    setFieldErrors({
      bio: '',
      occupation: '',
      company: '',
      interests: '',
      skills: '',
      social_links: {},
    });
    setError(null);
    setSuccess(false);
  }, [profile]);

  // Show skeleton loading
  if (isLoading) {
    return <SkeletonLoader />;
  }

  // Inline Editing State
  if (editMode) {
    return (
      <div className="max-w-4xl mx-auto">
        <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-200">Profil bearbeiten</h2>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-200 transition-colors"
              disabled={loading}
              title="Bearbeitung abbrechen"
              aria-label="Bearbeitung abbrechen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bio */}
          <div className="bg-dark-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-200">Über mich</label>
              <Tooltip content="Erzähle etwas über dich selbst. Maximal 500 Zeichen.">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </Tooltip>
            </div>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className={`w-full bg-dark-200 border rounded-lg p-3 text-gray-200 transition-all duration-200 resize-none ${fieldErrors.bio ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/20'}`}
              rows={4}
              maxLength={MAX_BIO}
              placeholder="Erzähle etwas über dich..."
              aria-label="Über mich"
              aria-describedby="bio-error bio-counter"
            />
            <div className="flex justify-between items-center mt-2">
              {fieldErrors.bio && (
                <div id="bio-error" className="text-red-400 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.bio}
                </div>
              )}
              <div id="bio-counter" className={`text-xs ml-auto transition-colors ${form.bio.length > MAX_BIO * 0.9 ? 'text-yellow-400' : 'text-gray-400'}`}>{form.bio.length}/{MAX_BIO}</div>
            </div>
          </div>

          {/* Beruf & Firma */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-dark-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-200">Beruf</label>
                <Tooltip content="Dein aktueller Beruf oder Tätigkeitsbereich">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <input
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                className={`w-full bg-dark-200 border rounded-lg p-3 text-gray-200 transition-all duration-200 ${fieldErrors.occupation ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/20'}`}
                maxLength={MAX_OCCUPATION}
                placeholder="z.B. Software Developer"
                aria-label="Beruf"
                aria-describedby="occupation-error"
              />
              {fieldErrors.occupation && (
                <div id="occupation-error" className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.occupation}
                </div>
              )}
            </div>
            <div className="bg-dark-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-200">Firma</label>
                <Tooltip content="Dein aktueller Arbeitgeber oder Unternehmen">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                className={`w-full bg-dark-200 border rounded-lg p-3 text-gray-200 transition-all duration-200 ${fieldErrors.company ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/20'}`}
                maxLength={MAX_COMPANY}
                placeholder="z.B. Tech GmbH"
                aria-label="Firma"
                aria-describedby="company-error"
              />
              {fieldErrors.company && (
                <div id="company-error" className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.company}
                </div>
              )}
            </div>
          </div>

          {/* Interessen & Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-dark-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-200">Interessen <span className="text-gray-400 font-normal ml-1">(max. {MAX_INTERESTS})</span></label>
                <Tooltip content="Deine Interessen werden als Tags angezeigt. Getrennt durch Kommas.">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <input
                name="interests"
                value={form.interests}
                onChange={handleChange}
                className={`w-full bg-dark-200 border rounded-lg p-3 text-gray-200 transition-all duration-200 ${fieldErrors.interests ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/20'}`}
                placeholder="z.B. Programmieren, Gaming, Musik"
                aria-label="Interessen"
                aria-describedby="interests-error interests-help"
              />
              {fieldErrors.interests && (
                <div id="interests-error" className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.interests}
                </div>
              )}
              <div id="interests-help" className="text-xs text-gray-400 mt-1">Getrennt durch Kommas</div>
            </div>
            <div className="bg-dark-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-200">Skills <span className="text-gray-400 font-normal ml-1">(max. {MAX_SKILLS})</span></label>
                <Tooltip content="Deine Fähigkeiten werden als Tags angezeigt. Getrennt durch Kommas.">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                className={`w-full bg-dark-200 border rounded-lg p-3 text-gray-200 transition-all duration-200 ${fieldErrors.skills ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/20'}`}
                placeholder="z.B. React, Python, Node.js"
                aria-label="Skills"
                aria-describedby="skills-error skills-help"
              />
              {fieldErrors.skills && (
                <div id="skills-error" className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.skills}
                </div>
              )}
              <div id="skills-help" className="text-xs text-gray-400 mt-1">Getrennt durch Kommas</div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-dark-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-200">Social Media Links</label>
              <Tooltip content="Füge Links zu deinen Social Media Profilen hinzu. Alle URLs müssen mit http:// oder https:// beginnen.">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </Tooltip>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SOCIAL_PLATFORMS.map((p, idx) => (
                <div key={p.key} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-20 flex-shrink-0">
                    <p.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm text-gray-300">{p.label}</span>
                  </div>
                  <input
                    id={`social-link-${p.key}`}
                    type="url"
                    placeholder={`https://...`}
                    value={socialLinks[idx].url}
                    onChange={e => handleSocialLinkChange(idx, e.target.value)}
                    className={`flex-1 bg-dark-200 border rounded-lg p-2 text-gray-200 text-sm transition-all duration-200 ${fieldErrors.social_links[p.key] ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-primary focus:ring-1 focus:ring-primary/20'}`}
                    aria-label={p.label}
                    aria-describedby={`social-error-${p.key}`}
                  />
                  {fieldErrors.social_links[p.key] && (
                    <div id={`social-error-${p.key}`} className="text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400 text-sm flex items-center gap-2 animate-in fade-in duration-200" role="alert">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-green-400 text-sm flex items-center gap-2 animate-in fade-in duration-200" role="alert">
              <Check className="w-4 h-4" />
              Erfolgreich gespeichert!
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              disabled={loading || hasErrors()}
              aria-describedby={hasErrors() ? "form-errors" : undefined}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Änderungen speichern
                </>
              )}
            </button>
            <button
              type="button"
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 font-medium"
              onClick={handleCancel}
              disabled={loading}
            >
              Abbrechen
            </button>
          </div>
          {hasErrors() && (
            <div id="form-errors" className="sr-only">
              Es gibt Validierungsfehler im Formular. Bitte korrigiere diese vor dem Speichern.
            </div>
          )}
        </form>
      </div>
    );
  }

  // View Mode: show all fields, always, with 'Noch keine Angaben' if empty
  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-4 sm:space-y-6">
        {/* Edit Button */}
        {isOwnProfile && (
          <div className="flex justify-end mb-2">
            <button
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 font-medium"
              onClick={() => setEditMode(true)}
              aria-label="Profil bearbeiten"
            >
              <Edit3 className="w-4 h-4" />
              Bearbeiten
            </button>
          </div>
        )}

        {/* Über mich */}
        <div className="bg-dark-100 rounded-lg p-4 sm:p-6 transition-all duration-200 hover:bg-dark-100/80">
          <h3 className="text-lg font-semibold mb-3 sm:mb-4 text-gray-200">Über mich</h3>
          {profile.bio ? (
            <p className="text-gray-300 whitespace-pre-line leading-relaxed text-sm sm:text-base">{profile.bio}</p>
          ) : (
            <div className="text-gray-500 italic bg-gray-800/30 rounded-lg p-3 sm:p-4 border-2 border-dashed border-gray-700">
              <p className="text-center text-sm sm:text-base">Noch keine Angaben</p>
            </div>
          )}
        </div>

        {/* Beruf & Firma */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-100 rounded-lg p-4 sm:p-6 transition-all duration-200 hover:bg-dark-100/80">
            <h4 className="text-md font-semibold mb-3 text-gray-200">Beruf</h4>
            {profile.occupation ? (
              <p className="text-gray-300 text-sm sm:text-base">{profile.occupation}</p>
            ) : (
              <div className="text-gray-500 italic bg-gray-800/30 rounded-lg p-3 border-2 border-dashed border-gray-700">
                <p className="text-center text-sm">Noch keine Angaben</p>
              </div>
            )}
          </div>
          <div className="bg-dark-100 rounded-lg p-4 sm:p-6 transition-all duration-200 hover:bg-dark-100/80">
            <h4 className="text-md font-semibold mb-3 text-gray-200">Firma</h4>
            {profile.company ? (
              <p className="text-gray-300 text-sm sm:text-base">{profile.company}</p>
            ) : (
              <div className="text-gray-500 italic bg-gray-800/30 rounded-lg p-3 border-2 border-dashed border-gray-700">
                <p className="text-center text-sm">Noch keine Angaben</p>
              </div>
            )}
          </div>
        </div>

        {/* Interessen & Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-100 rounded-lg p-4 sm:p-6 transition-all duration-200 hover:bg-dark-100/80">
            <h4 className="text-md font-semibold mb-3 sm:mb-4 text-gray-200">Interessen</h4>
            {profile.interests && profile.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, i) => (
                  <span key={i} className="bg-primary/20 text-primary px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm transition-all duration-200 hover:bg-primary/30">{interest}</span>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic bg-gray-800/30 rounded-lg p-3 border-2 border-dashed border-gray-700">
                <p className="text-center text-sm">Noch keine Angaben</p>
              </div>
            )}
          </div>
          <div className="bg-dark-100 rounded-lg p-4 sm:p-6 transition-all duration-200 hover:bg-dark-100/80">
            <h4 className="text-md font-semibold mb-3 sm:mb-4 text-gray-200">Skills</h4>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="bg-secondary/20 text-secondary px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm transition-all duration-200 hover:bg-secondary/30">{skill}</span>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic bg-gray-800/30 rounded-lg p-3 border-2 border-dashed border-gray-700">
                <p className="text-center text-sm">Noch keine Angaben</p>
              </div>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-dark-100 rounded-lg p-4 sm:p-6 transition-all duration-200 hover:bg-dark-100/80">
          <h4 className="text-md font-semibold mb-3 sm:mb-4 text-gray-200">Social Links</h4>
          {profile.social_media_links && Object.values(profile.social_media_links).filter(Boolean).length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {SOCIAL_PLATFORMS.filter(p => profile.social_media_links[p.key]).map(p => (
                <a key={p.key} href={profile.social_media_links[p.key]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm transition-all duration-200 hover:scale-105">
                  <p.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">{p.label}</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic bg-gray-800/30 rounded-lg p-3 border-2 border-dashed border-gray-700">
              <p className="text-center text-sm">Noch keine Angaben</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileAboutSection; 