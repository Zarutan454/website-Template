// src/components/TableOfContents.jsx
import { useEffect, useState } from 'react';
import useIntersectionObserver from '../utils/useIntersectionObserver';

const TableOfContents = () => {
  const [ref, isInView] = useIntersectionObserver({ threshold: 0.1 });
  const [animationStarted, setAnimationStarted] = useState(false);
  
  useEffect(() => {
    if (isInView && !animationStarted) {
      setAnimationStarted(true);
    }
  }, [isInView, animationStarted]);

  // Table of contents items
  const contents = [
    { title: "Opening Spread", description: "More than hydration—it's a moment", page: "01" },
    { title: "The Essence", description: "Cold clarity & Silent strength", page: "02-03" },
    { title: "Product Design", description: "Crafted in 2025. Designed for 2030", page: "04" },
    { title: "Last Word", description: "The future in a bottle", page: "05" }
  ];

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden py-20"
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAOl0lEQVR4nO1dbVczNw69JCEvBJInEEIgEIb//6/6fbu3L7T9WNKRfDZ7nkx6vvTMxrlOZnck60iWJVmW/eleEhBAAgwAxOmB5BRK/HPgZKLevYym/nfTQ0LSECgZM/5FkHGk0P+bMIZAyICGrf8lMEZgEKiM/H8Gxh4gBKAlwKSGvlWZJM8/8r+J+HP3txiL7nfg/hGg/EsRhkAWwDL4FjiDoMaRnNL0RPY38ofRXzUMInAC+ZsQioDRGMDjaMFIB5A/UicBJGcm1Pg+gPw9cdRYgQMUgQKLgYvRnwly5XxO/vGQY0f+3XO+bKz/aIQhiDDhtJwSYPGA3JfJCpJoGicP1KSVuJ9ntfS9IhCA4D9Mtw8/mqM/EmEIBOvmOlk2Hym4xsHVNhls48GfZ9DtkYXuQHF6HuL/M0D+MIQhkhIxBQEGiWHpMjFF/4wCwonqmMdV+XJI/rG0dA5QZfn/TAqRYa0BS2M93YBBQMxkftNxQYTC0q29tLQEQg1PK1lDt7Z/JmEIiCmtx9IwgUHyBGwgCGKwjW7GRB5QKEBQvTX4ofRyLoGoYws79m9NGAKAFbszLW1aigQA6sSTOgrgVpM3OQCofNRzVZqXF2qtlc8Bjz0/eE21HYBsphaVr0ITulz+toQhIqbrTYNoWvLvOgdEzgRII96Mri3PAesen6alyN0DMVBNKVL6/VhL7+8hCIid1Yzw5mzV2JGzPJX71OTSvS6fx+rf2E/8iKxh9FyaNgvX9dL3EoRIrpx7lQ9HajhjSUu8XhHE5B8zESQSLXli+Vj9SUu9+UQz/OOB/B6CEAwyP3+XedM0IHVyi/4jOjc+I2S1QY0VuXKsiD9t/uY+3EXh7fO1f0iakpe6J/fZ8MvTmyBEcs/pTWfgUPsMjo7XJLkwIEzycIIptV8HBP28z30tTZtjVb6SWvdF37cpRJB7K08GyIdCJMeDeZD4YF93FiWc0Y7JbQmC5uwuAYh9LpMb8Xcc9Zj79HSiKHo7M9PTtr2vyHDC2KcTzsnc3GnNcNYwiIIQYhEoQjTqX5gREW3DOQiIslHQsk6YQPTzfZ4O6Az9fJ8iOz33vVIMYqXpRYrk5MjyaRSFwK2vm/Gb+bY7DCCzJ8MxQN9EVGUGG8aH9LP0PgBAyPzJ2A01rK8nFTlKfB36TUDml49rFus1IxVv5Ui1hdOPkxP1+z2G224N0hf3/B6EXhqrFCPbPMElVamHJ6HcK6p7EfgwfQiDLiH7elvqMlUfQj9CdAGpZeJ+q3zeqUWS0+aUScfXu/T2QJ8J8MYCA3uHlHqXSpUrdelzJRy8ZtpwOJg2yyfCwJlethx1kkEgKwt1NiulTaYmoQy2ypVYvAvvMpHetOKnRiQQBeeBiTDjz+snRBkeQOOIq9BkIFdqQWt6KHcoi2G5Qa0+JMk9ke7UYlHrbYU23VTsVAQR9De4aaqo3jZdWFDXW94QAJQZOfdZhPqgqNkSCKL7fO67PgNBPpQzSB6xrqFtVMvvSTVKesg9BJnNZaL7fk8HQ+YM7oYQtYUSD3ItZ6Bdx+s1PSzDKNnIVe5GjXTDwDZWa9mJCPXheExZxb6CzGvtQyiTnSg67p4h2YdXqcTUVdTNxvaikUEX5JtKKsxAPffl+wUgbCArvUKutfdykLWUOch37nPWRmPTw5bT0/dL+icqJGXe7JPrkIc1VOCDH6RqpbMx2B6CbiRHaUKmxsT/QJv4j3JH9U3E8ltOTipZSfWW1BSR+3JQhSMpf0hhPEERlVocHsKlNUE9+vu6Vkkl4aSctRDlQ9as5mR+c55ImRz32JWh342VfLpsBWK5KC+QDLYvZIrT3KOZYgfYiQ/XpOedXLRXqWSvN9Mg1xlsuQT8Torc1Qn7hKKywiWs+qObtSjUoMIMTef+pjpdc0Ju91B56GEmoiy2Bh9//zdVvV22mD8Ymdz4Ned5Thne4Ph7yDwkqsUECBPLRCTi5w1YUgqiJGc4/nTI7aaJjHzXwlgtFsEMkW2O1CQv9Ba8lyapXCfYPCTHy9c/TTraHtNxouSF3jGz3MOqoXQMQi8MtLcWndjIdLd57ImKEQFxjQ67npYEYevRm3UmlktmHACLm9AgmkTJ2cvRlVKyzNjUzvs95z5fG5ipFz+Il1nNWcScsyJCxTNcqBjVL3E8NK0+HYwhBo2la4cRPIuP0ZR8zFTlYjY6WlcmIySyd+VxepSP5GRLcCHO9AjECNOXEECmFjWrk/dwfMHJJdsB1zvQsIYJ7jBn86ytqwmZ3AIw2FJO4WZmVKw8cz9L9ZYdKpJBHRLg6azeYxHCVAAWlTtjXnfsrmBizXbXUydanxQVK0LVvnIcJgjVG+cGEaz6uL8Xc48xboROhyM76QH5pTZWP7mqF8rv8fo7BPD5thAJ2Qf9QImFjHybiIiZ4uaZZJU89GUPZrUhJr9/qpMizOh66oYhRMqTnW6mvNw+ZXrLDDpBnMK6426CfwKzGaypI9yOK7fE1XqRfWe0T4gvB5QvzS/oXCtqiQJ0HysJpSkgAyzH8UFL9FQlbPfWbx6QfX63Dg8/bwkf/5F3VV91EFnzvXvWRNkfZwHM8PUxo/FuQioZ2Z9p5AMFdCJDVprSWHJcb4TdGVvTyiiIEepsHgZGGJA4aiaWRcokchXvqYGMDIfbRp1KdaIWvMZuGE7svvwiNtyx+qAZZDmhF466etKMwsegeVNfQ0VPd7OhsmaOZAzL9rRagGgbEpmu3pVVXiqjs0It/mz6gyVr39Rye77dRG9KVlHcpxdfu9NcWtvmtnpuZnRYK1Kh7jNwJ1fskYbALpJIlRy791SMTmuCx1KMB9b076W1Ppz9w/+nO/Vw/N32ElFJRSdy0OJ/DpkbpSWZsw500jmrTnQpACUKUhsUEkluM6KrKlIYB+93EdHntGG+XqiV0Q/OZpuLVBCRRYNSC974eme4BO5KWXvbWWukzi3r/RlGNBzIuV3XHohQoqBRuIXq9SZpct8fiMAYfUzB1uj9ESdZW5WO7uu3lRH0jYUs2x4vCbFLV56Vnskpem5EMXRjVDTftZK9JK8lsQt6KsSrRUevPJMGk5PUB6mCQm5Lqwpqf8+/jZF62WWVp0Fa6FiCIW019KRq8MiTY8wAAyzP71+F7IQEF9Pn8jhK2WvVX+tAg2oKUGWatSCyvWBvayzEEqroh+1lX7VfQvVR6laiTtsmXD7yQwgGo5O2FP7E0M8yhwWF8p6GFXrXKnYXCWeeUf4rIcXuhvcZ8njfvRNJW/Z7R4T9yAhGhdLabqfGFj6iRylyO4tOO9iKDb6x6B6vzhDY6kGIEH4PcHuT2CGZ7bLwpT9F5NKyDY5LsmIOpZWuf935YZbGbMXYKY18slhTdR6XZ9ehPH/UNj1aIj7+Z5f0m0P0daA6OGF7erZt5mYCEifhTZXWVCKeiKdRu9HdkW43zfAYX4pao4qHCK7SIm1mX5rxnXiNJFhJB5iw/yXB4fIw7yG7WK+1geCXkMt8PCigPdeXmu9nEeUJShi7CXttAfSS87PWoj0UfRkGhtWi5FsXbfAW4GO8lDmtn8lAO6SK1nIz6L9g9DTUAaniKFd5poAqVoI+4UF7JxuemYroqiQCQNFlB3BQZg7ByhNnAxTRRnU1C9r4QlyLSq+eVfgsOvi8vhTVPKScQCJniVgIxlw1S1l/rnXIP4SqajAxkkFRWJdG4FtTHZp+63m9Tzv3TuozK0IwkBnkeErlm6d8Vj5IYNoLxJIMCfLpwQabF2H3d3FkuYTV2ae6+kBTxlnXi3X84KYKaY1BPmFtZX8g+iXJXu4BXjMYU1W+9d+2xMzT2AfmKesNBR3Pj5IldE0urpivobXosVRBJP2aQeCFIQP6DuaHliNpgL+nWdYyxl9TsbrZNwiryp0qHH5qrW1nrGGu1c2RFCmeKK83rlWoUjPTlG5batdYoFun6VwcpGb3FBJBuN2Qf/8idlEexVgZ6E5iL8fPThw3BzohkTwIZZgglNVKhXmrMXCsX3M+kmXv0SwHrKyQdyZFkCS/pVLkXZK4rhANl8XbQ7fM57SwT/j8wr4j7f0uGAOHomXsBh35JO9rHqLXOcvxUVD9leqIAY4GQbZpnEq9qOzgMBcablrm7ChDsnH8/FpkU990QLjg8tM4tt3sx8/fZVY3dciXeJgej75rhyrvBKoi8AC+w6nxvLTdnJ0pG6n7PVI6NSK0jyZa8/+l34tDNB9Pa/r6vvCtDxU3tR0UUxNhJf19Qbes25eK0CK2nfOYI85myIMZSPkv1U749Q3gQS/mpAHKVFjgAGUcEno09q6hcaquuBJCjlvJppJhw+jAsYKQwARP5KFfXqpNG7Y+2dQrT5Eope2obTy1FhEVlhzwKAQYtMmFqIBREZ3frda2QCzBbJ1PM0FI9WiUC4ZPI0NsCz3+TJk4eRnkAQbgDACBEAjMHJVz/4Nm1Q9gILQ/oYt0ToRb0AL2oBbQXYxVlT/8KTUusyNm9Dyz+3hkhfvdLs2Vpm2luPpSbC7laz7leDMEb0OiR1VpBxGqP19Gs09ikFq0XyDxU0doUUnm4u0e9cnmP1zZ+i3mteFwTSv8K84pAeVspR6+Mx54nxw3lWPNiR/gaXPkaEPl8n0fDUKCn6b3kJPCyiLDPevaREecr8X1MeRHVgRml5blCl6M1KZTeVLvGULCt5KWpiQwZA3Oviooam0eyFwAQIqHtHrADYRIJR7VA4D5DgHxIOzPBXMQT1bVTLfya76xcCPtUfAtnEHsNDZRzWi82CfnSa5mP1x95NXoEvxlm2/T9iyFjcDMKiUFP1IkgyYOtBcnXaOe50XJe1YNanlMQzXR7xdEiLr4CLQ5BfUYgX6l2uTgHhWgOZv9kUEIv5vnRnUJvfwc3y4c49VoJMEZAFPek5MsI5QmhvUAr20NmZ2ApMDLzVczd8rf+QeGjgQzfMRhh3pqUwWDhG9KeOT6c5oUxCJTo9+gB/ESwB9z3HCQfO09z8urxuFTm/7Z69kOY00Se/veK5ZxvAkZkrn5mr5ecWtUHLaeeKw==')]  opacity-5 mix-blend-overlay"></div>

      {/* Content container with subtle grid */}
      <div className="relative z-10 container mx-auto px-8">
        <div className={`${animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 ease-out`}>
          {/* Magazine-style header */}
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-light tracking-widest text-white">IN THIS ISSUE</h2>
            <div className="hidden md:flex items-center">
              <div className="h-[1px] w-32 bg-white/20 mr-4"></div>
              <span className="text-white/50 text-sm uppercase tracking-widest font-light">Spring 2025</span>
            </div>
          </div>
          
          {/* Contents grid with timeline */}
          <div className="relative">
            {/* Vertical timeline */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-white/20 hidden md:block"></div>
            
            {/* Content items */}
            <div className="space-y-12 md:space-y-16 pl-0 md:pl-8">
              {contents.map((item, index) => (
                <div 
                  key={index}
                  className={`flex flex-col md:flex-row items-start md:items-center group ${
                    animationStarted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                  } transition-all duration-1000 ease-out`}
                  style={{ transitionDelay: `${index * 200 + 300}ms` }}
                >
                  {/* Timeline node */}
                  <div className="hidden md:block absolute -left-1.5 w-3 h-3 rounded-full bg-white/20 group-hover:bg-white/60 transition-all duration-300"></div>
                  
                  {/* Content number */}
                  <div className="w-16 pb-2 md:pb-0">
                    <span className="text-xl text-white/40 font-mono group-hover:text-white/70 transition-all duration-300">{(index + 1).toString().padStart(2, '0')}</span>
                  </div>
                  
                  {/* Article title */}
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-light text-white mb-1 tracking-wide">{item.title}</h3>
                    <p className="text-white/50 font-light">{item.description}</p>
                  </div>
                  
                  {/* Page number */}
                  <div className="mt-2 md:mt-0 md:ml-8">
                    <span className="text-xs text-white/40 border border-white/20 px-3 py-1 rounded-sm group-hover:border-white/40 transition-all duration-300">{item.page}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Magazine footer element */}
          <div className="mt-20 pt-6 border-t border-white/10 flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xs uppercase tracking-widest text-white/30">APOXIAZULE</span>
            </div>
            <div className="flex items-center">
              <div className="h-[1px] w-12 bg-white/20 mr-3"></div>
              <span className="text-white/30 text-xs">CONTENTS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TableOfContents;