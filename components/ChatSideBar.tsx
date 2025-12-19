import React, { useEffect } from 'react';
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { useTheme } from 'next-themes' // Adjust the import path as needed
import { MessageSquare } from 'lucide-react'; 
import ReactDOMServer from 'react-dom/server'; // Import ReactDOMServer
import { useCopilotReadable } from "@copilotkit/react-core"; 
import { supabase } from '@/lib/supabaseClient';

const CopilotSideBarComponent: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [profile, setProfile] = React.useState<any | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);

  useCopilotReadable({
    description: "The current user's full financial information including first name, last name, gross salary, net salary, income from other sources, and income from house property. All values are shown without masking.",
    value: profile,
  });

  React.useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        const fetchProfile = async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('first_name, last_name, gross_salary, income_from_other_sources, income_from_house_property, net_salary')
            .eq('id', user.id)
            .single();
          if (error) {
            console.error('Error fetching profile:', error);
          } else {
            setProfile(data);
            
            // Update vector store via API call (server-side only)
            if (data && data.first_name && data.last_name) {
              try {
                await fetch('/api/update-vector-store', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: user.id, profile: data }),
                });
                console.log('User financial context updated in vector store');
              } catch (vectorError) {
                console.error('Error updating vector store:', vectorError);
              }
            }
          }
        };

        fetchProfile();
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const iconContainer = document.querySelector('.copilotKitButtonIcon');
    if (iconContainer) {
      iconContainer.innerHTML = ''; // Clear any existing content
      const iconElement = ReactDOMServer.renderToString(<MessageSquare size={32} className="icon-responsive text-white" />);
      iconContainer.innerHTML = iconElement;
    }
    
  }, []);

  return (
    <>
      <CopilotPopup
        instructions={`You are a friendly and knowledgeable assistant for the FinSeva app, guiding users through income tax filing, providing personalized tax recommendations, and connecting them to expert support when needed. 

Key Guidelines:
- Answer in accordance to Indian taxation laws and rules
- Respond to user queries in short and concise way
- Talk in a human way, not like a robot
- Ask and respond in bullet points when appropriate
- Use the user's financial data that will be provided in the context to give personalized recommendations
- All financial figures are actual values - use them directly in your responses
- When discussing the user's finances, address them by their first name to make it more personal
- Provide specific tax-saving suggestions based on their income levels
- The user's financial information will be retrieved from the knowledge base and provided in the context`}        
        labels={{
          title: "FinSeva Assistant",
          initial: `Welcome to FinSeva${profile?.first_name ? `, ${profile.first_name}` : ''}! Your personal assistant for hassle-free income tax filing and smart tax recommendations. How can I assist you today?`,
        }}
        clickOutsideToClose={true}
        properties={{
          userId: userId,
          userProfile: profile,
        }}
      />
      {/*
      <style>
        {`copilotKitSidebar
.copilotKitHeader {
  background-color: ${isDarkMode ? '#2d3748' : 'rgb(199 210 254)'} !important;
  color: ${isDarkMode ? 'white' : 'rgb(55 48 163)'} !important;
}
.copilotKitButton {
  background-color: rgb(99 ,102 ,241) !important; 
  color: white !important; 
  width: 4rem !important; 
  height: 4rem !important; 
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1); 
  padding: 1rem 2rem;
  border-radius: 50%; 
  transition: background-color 0.3s ease-in-out;
  cursor: pointer;
  &:hover {
    background-color: rgb(79 70 229) !important; 
  }

  @media (min-width: 640px) {
    width: 4.2rem !important;
    height: 4.2rem !important;
  }
  @media (min-width: 768px) { 
    width: 5rem !important;
    height: 5rem !important;
  }

  .dark & {
    background-color: rgb(99,102,241) !important; 
  }

  .dark &:hover {
    background-color: rgb(67 56 202) !important; 
  }
}
.copilotKitSidebar {
  top: 80% !important;
  right: 10% !important;
  color: ${isDarkMode ? 'white' : 'rgb(55 48 163)'} !important;
}

.copilotKitDevConsole > :nth-child(3), .copilotKitDevConsoleLog, .copilotKitDevConsole{
  display: none;
}

.copilotKitVersionInfo {
  color: ${isDarkMode ? 'rgb(226 232 240)' : 'rgb(55 48 163)'};
}

.copilotKitWindow {
  top:10% !important; // Added top
  height: 50% !important; // Added height
  max-height: 50% !important;
  overflow: hidden !important;
}
.copilotKitMessages {
    height: 50% !important; 
}
.copilotKitMessages,.copilotKitWindow  {
  background-color: ${isDarkMode ? '#182130' : 'rgb(238 242 255)'} !important;
}

.copilotKitMessage.copilotKitUserMessage {
  background-color: ${isDarkMode ? '#2d3748' : 'rgb(165 180 252)'} !important;
  color: ${isDarkMode ? 'rgb(226 232 240)' : 'rgb(55 48 163)'} !important;
}

.copilotKitMessage.copilotKitAssistantMessage {
  background-color: ${isDarkMode ? '#2a3b53' : 'rgb(224 231 255)'} !important;
  color: ${isDarkMode ? 'rgb(226 232 240)' : 'rgb(55 48 163)'} !important;
}
  .copilotKitInput {
  background-color: ${isDarkMode ? '#1e2a3e' : 'rgb(248 250 252)'} !important;
  border-top: 1px solid ${isDarkMode ? '#2d3748' : 'rgb(226 232 240)'} !important;
  padding: 12px !important;
}

.copilotKitInput > textarea {
   background-color: ${isDarkMode ? '#1e2a3e' : 'rgb(248 250 252)'} !important;
  color: ${isDarkMode ? 'rgb(226 232 240)' : 'rgb(55 48 163)'} !important;

}

.copilotKitInput > textarea:focus {
  outline: none !important;
}
  .copilotKitResponseButton {
  background-color: ${isDarkMode ? 'rgb(79 70 229)' : 'rgb(99 102 241)'} !important;
  color: white !important;
  border: none !important;
  border-radius: 6px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out !important;
}

.copilotKitResponseButton:hover {
  background-color: ${isDarkMode ? 'rgb(67 56 202)' : 'rgb(79 70 229)'} !important;
  transform: translateY(-1px) !important;
}

.copilotKitResponseButton:active {
  transform: translateY(1px) !important;
}

.copilotKitResponseButton:disabled {
  background-color: ${isDarkMode ? 'rgb(74 85 104)' : 'rgb(203 213 224)'} !important;
  cursor: not-allowed !important;
  transform: none !important;
}
        `}
      </style>
      */}
      <div className={`copilotKitStyles ${isDarkMode ? 'dark' : 'light'}`}></div>
    </>
  );
};

export default CopilotSideBarComponent;