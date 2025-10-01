
import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../state/settingsStore';

const teamMembers = [
  { name: 'Hasan', role: 'Programmer', icon: 'ri-braces-line', location: 'Chandina, Cumilla' },
  { name: 'Adib', role: 'Designer', icon: 'ri-palette-line', location: 'Chandina, Cumilla' },
  { name: 'Zyan', role: 'Concept Lead', icon: 'ri-lightbulb-flash-line', location: 'Pabna' },
  { name: 'Eshan', role: 'Technical Improver', icon: 'ri-line-chart-line', location: 'Chandina, Cumilla' },
  { name: 'Syiam', role: 'Support & Operations', icon: 'ri-team-line', location: 'Chandina, Cumilla' },
  { name: 'Fahim', role: 'Bug Tester', icon: 'ri-bug-line', location: 'Chandina, Cumilla' },
];

const translations = {
    en: {
        title: "About Cosmoscope",
        subtitle: "Our mission is to bring the cosmos closer to everyone by blending cutting-edge AI with real-world space data.",
        projectIntro: "Cosmoscope is our innovative submission for the",
        nasaChallenge: "NASA International Space Apps Challenge 2025",
        p1: "With Cosmoscope, you can explore our planet in detail using the <strong>Earth Explorer</strong>. Pinpoint locations by clicking the interactive map or use the smart search bar to find any place on Earth. Our AI, powered by Google's Gemini with real-time search grounding, will provide you with up-to-date information, from weather forecasts to fun facts about your chosen location. You can also journey to the Red Planet with our <strong>Mars Rover Gallery</strong>, featuring a stunning collection of real images from the Curiosity Rover, each with the option to generate a unique, AI-written story from the rover's perspective.",
        p2: "Cosmoscope represents our passion for space, technology, and creating intuitive, inspiring user experiences. We continuously strive to add new features and improve the application to make cosmic exploration accessible and engaging for everyone. We're excited to share our vision with you.",
        teamTitle: "Meet Our Team",
        teamName: "Team Revo BD",
    },
    bn: {
        title: "কসমোস্কোপ সম্পর্কে",
        subtitle: "আমাদের লক্ষ্য হল অত্যাধুনিক এআই এবং বাস্তব মহাকাশ ডেটা ব্যবহার করে মহাবিশ্বকে সবার কাছে নিয়ে আসা।",
        projectIntro: "কসমোস্কোপ হলো আমাদের একটি উদ্ভাবনী প্রজেক্ট",
        nasaChallenge: "নাসা আন্তর্জাতিক স্পেস অ্যাপস চ্যালেঞ্জ ২০২৫",
        p1: "কসমোস্কোপের মাধ্যমে, আপনি <strong>আর্থ এক্সপ্লোরার</strong> ব্যবহার করে আমাদের গ্রহকে বিস্তারিতভাবে অন্বেষণ করতে পারেন। ইন্টারেক্টিভ ম্যাপে ক্লিক করে বা স্মার্ট সার্চ বার ব্যবহার করে পৃথিবীর যেকোনো স্থান খুঁজুন। আমাদের এআই, যা গুগলের জেমিনি এবং রিয়েল-টাইম সার্চ গ্রাউন্ডিং দ্বারা চালিত, আপনাকে আপনার নির্বাচিত অবস্থান সম্পর্কে আবহাওয়ার পূর্বাভাস থেকে শুরু করে মজার তথ্য পর্যন্ত আপ-টু-ডেট তথ্য সরবরাহ করবে। এছাড়াও আপনি আমাদের <strong>মার্স রোভার গ্যালারী</strong>র মাধ্যমে লাল গ্রহে যাত্রা করতে পারেন, যেখানে কিউরিওসিটি রোভারের বাস্তব চিত্রগুলির একটি অত্যাশ্চর্য সংগ্রহ রয়েছে এবং প্রতিটি ছবির জন্য রোভারের দৃষ্টিকোণ থেকে একটি অনন্য, এআই-লিখিত গল্প তৈরি করার বিকল্প রয়েছে।",
        p2: "কসমোস্কোপ মহাকাশ, প্রযুক্তি এবং ব্যবহারকারীদের জন্য সহজ ও অনুপ্রেরণামূলক অভিজ্ঞতা তৈরির প্রতি আমাদের আবেগকে উপস্থাপন করে। আমরা ক্রমাগত নতুন বৈশিষ্ট্য যুক্ত করতে এবং মহাজাগতিক অন্বেষণকে সবার জন্য সহজলভ্য ও আকর্ষণীয় করে তুলতে অ্যাপ্লিকেশনটির উন্নতি সাধনে সচেষ্ট। আমরা আপনাদের সাথে আমাদের দৃষ্টিভঙ্গি ভাগ করে নিতে পেরে আনন্দিত।",
        teamTitle: "আমাদের দলের সাথে পরিচিত হন",
        teamName: "টিম রেভো বিডি",
    }
};


const AboutPage: React.FC = () => {
    const { subscribe, getSnapshot } = useSettingsStore();
    const [language, setLanguage] = useState(getSnapshot().language);

    useEffect(() => {
        const unsubscribe = subscribe(() => {
            setLanguage(getSnapshot().language);
        });
        return unsubscribe;
    }, [subscribe, getSnapshot]);

    const t = translations[language];

  return (
    <div className="container mx-auto p-6 text-center text-gray-700 dark:text-gray-300">
      <div className="max-w-4xl mx-auto">
        
        {/* About the Project Section */}
        <section className="mb-16">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{t.title}</h1>
          <div className="w-24 h-1 bg-gray-800 dark:bg-blue-500 mx-auto mb-6"></div>
          <p className="text-lg leading-relaxed mb-4">
            {t.projectIntro}{' '}
            <span className="font-semibold text-gray-900 dark:text-blue-400">{t.nasaChallenge}</span>.
            {' '}{t.subtitle}
          </p>
           <p className="text-lg leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: t.p1 }} />
          <p className="text-lg leading-relaxed">
            {t.p2}
          </p>
        </section>

        {/* Meet Our Team Section */}
        <section>
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{t.teamTitle}</h2>
          <p className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-4 tracking-wider">{t.teamName}</p>
          <div className="w-20 h-1 bg-gray-800 dark:bg-blue-500 mx-auto mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div key={member.name} className="bg-white dark:bg-[#1f2937] p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transform hover:-translate-y-2 transition-transform duration-300">
                <div className="flex flex-col items-center">
                  <div className="bg-gray-800/10 text-gray-700 dark:bg-blue-500/20 dark:text-blue-300 rounded-full p-4 mb-4">
                    <i className={`${member.icon} text-4xl`}></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-gray-800 font-semibold dark:text-blue-400">{member.role}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                    <i className="ri-map-pin-2-line"></i>
                    {member.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default AboutPage;
