"use client";

import { motion } from "framer-motion";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconCloudUpload,
  IconBrain,
  IconLayoutKanban,
  IconUsers,
  IconRefresh,
  IconSparkles,
} from "@tabler/icons-react";

export default function Features() {
  const features = [
    {
      title: "Multi-Format Support",
      description:
        "Upload meetings, PDFs, slides, and more. We handle all your project documentation seamlessly.",
      header: <SkeletonOne />,
      icon: <IconCloudUpload className="h-6 w-6 text-neutral-500" />,
      className: "md:col-span-2",
    },
    {
      title: "Smart Task Extraction",
      description:
        "AI reads, understands, and summarizes content to extract actionable tasks automatically.",
      header: <SkeletonTwo />,
      icon: <IconBrain className="h-6 w-6 text-neutral-500" />,
      className: "md:col-span-1",
    },
    {
      title: "Agile-Ready Dashboard",
      description:
        "Kanban and priority views for easy project tracking. Drag, drop, and organize with ease.",
      header: <SkeletonThree />,
      icon: <IconLayoutKanban className="h-6 w-6 text-neutral-500" />,
      className: "md:col-span-1",
    },
    {
      title: "Collaboration & Assignment",
      description:
        "Get automatic task suggestions or manually assign work to team members.",
      header: <SkeletonFour />,
      icon: <IconUsers className="h-6 w-6 text-neutral-500" />,
      className: "md:col-span-2",
    },
    {
      title: "Real-Time Updates",
      description:
        "Tasks sync instantly as content is added or edited. Always stay in the loop.",
      header: <SkeletonFive />,
      icon: <IconRefresh className="h-6 w-6 text-neutral-500" />,
      className: "md:col-span-1",
    },
    {
      title: "AI-Powered Insights",
      description:
        "Get intelligent recommendations on priorities, deadlines, and task dependencies.",
      header: <SkeletonSix />,
      icon: <IconSparkles className="h-6 w-6 text-neutral-500" />,
      className: "md:col-span-2",
    },
  ];

  return (
  <section className="py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-0"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to transform your project management workflow
          </p>
        </motion.div>

        <BentoGrid className="max-w-7xl mx-auto">
          {features.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              className={item.className}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}

const SkeletonOne = () => {
  return (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-900 dark:to-cyan-900"></div>
  );
};

const SkeletonTwo = () => {
  return (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-900 dark:to-pink-900"></div>
  );
};

const SkeletonThree = () => {
  return (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 dark:from-indigo-900 dark:to-purple-900"></div>
  );
};

const SkeletonFour = () => {
  return (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 dark:from-green-900 dark:to-emerald-900"></div>
  );
};

const SkeletonFive = () => {
  return (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-orange-500 to-red-500 dark:from-orange-900 dark:to-red-900"></div>
  );
};

const SkeletonSix = () => {
  return (
    <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 dark:from-yellow-900 dark:to-orange-900"></div>
  );
};
