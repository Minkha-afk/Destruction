"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type OnlineUser = {
  id: string
  name: string
  avatar?: string
}

type Props = {
  users: OnlineUser[]
}

export default function OnlineUsersBar({ users }: Props) {
  return (
    <div className="sticky top-0 z-20 w-full rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
      <div className="scrollbar-thin mx-auto flex w-full max-w-4xl items-center gap-4 overflow-x-auto px-4 py-3">
        <span className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-emerald-300/90">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          {users.length} online
        </span>
        <TooltipProvider delayDuration={100}>
          <motion.ul
            className="flex items-center"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
              show: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {users.map((u) => {
              const initials = u.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
              return (
                <motion.li
                  key={u.id}
                  variants={{ hidden: { opacity: 0, scale: 0.8, y: 4 }, show: { opacity: 1, scale: 1, y: 0 } }}
                  className="-ml-2 first:ml-0"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.12, y: -2, zIndex: 10 }} className="relative">
                        <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                          <AvatarImage src={u.avatar || "/placeholder.svg"} alt={u.name} />
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500/40 to-violet-500/40 text-xs font-semibold text-indigo-50">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        {/* online dot */}
                        <span
                          aria-hidden
                          className="absolute bottom-0 right-0 inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-background"
                        />
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {u.name}
                    </TooltipContent>
                  </Tooltip>
                </motion.li>
              )
            })}
          </motion.ul>
        </TooltipProvider>
      </div>
    </div>
  )
}
