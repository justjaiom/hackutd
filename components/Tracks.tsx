'use client'

import { motion } from 'framer-motion'
import { Building2, Rocket, Zap } from 'lucide-react'

const steps = [
  {
    id: '01',
    title: 'Data Ingestion',
    description:
      'Users upload or connect various project inputs, including meeting recordings/notes, transcripts, or documents.',
  },
  {
    id: '02',
    title: 'Lead Agent',
    description:
      'A "Lead Agent" processes this data to gain full project context and understanding. It identifies goals, key milestones, dependencies, and tensions.',
  },
  {
    id: '03',
    title: 'Task Assignment',
    description:
      'The lead agent spawns specialized sub-agents (design, engineering, marketing, planning). Each analyzes a specific domain and collaborates to draft detailed deliverables.',
  },
  {
    id: '04',
    title: 'Output Generation',
    description:
      'Agents collectively build a dynamic Jira board with task cards, AI-generated priorities, deadlines, and status labels (To-Do, In Progress, Review, Done).',
  },
  {
    id: '05',
    title: 'User Interaction',
    description:
      'A built-in chatbot interface allows users to ask questions about tasks, priorities, or timelines, and make live edits. Changes are instantly synchronized.',
  },
]

export default function Tracks() {
  // Tracks/HowItWorks removed per user request
  return null
}

