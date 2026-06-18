"use client"

import { Badge } from "@/components/ui/badge"
import { Clock, PlayCircle, BookOpen, ExternalLink } from "lucide-react"

/**
 * Renders level educational content:
 * - YouTube / video embed if videoUrl is present
 * - Structured text content split into readable sections
 */

function getYouTubeEmbedUrl(url: string): string | null {
    try {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
        if (match) return `https://www.youtube.com/embed/${match[1]}?rel=0`
        // already an embed URL?
        if (url.includes("youtube.com/embed/")) return url
        return null
    } catch {
        return null
    }
}

function renderContent(content: string) {
    // Split by double newlines into sections, then render each paragraph
    const sections = content.trim().split(/\n{2,}/)
    return sections.map((section, i) => {
        const trimmed = section.trim()
        if (!trimmed) return null

        // Heading-style: starts with # / ## / ###
        if (trimmed.startsWith("### ")) {
            return <h4 key={i} className="font-display text-sm font-semibold text-foreground mt-5 first:mt-0">{trimmed.slice(4)}</h4>
        }
        if (trimmed.startsWith("## ")) {
            return <h3 key={i} className="font-display text-base font-semibold text-foreground mt-5 first:mt-0">{trimmed.slice(3)}</h3>
        }
        if (trimmed.startsWith("# ")) {
            return <h2 key={i} className="font-display text-lg font-semibold text-foreground mt-5 first:mt-0">{trimmed.slice(2)}</h2>
        }

        // Bullet list
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            const items = trimmed.split("\n").filter(l => l.match(/^[-*] /))
            return (
                <ul key={i} className="space-y-1.5 text-[15px] leading-relaxed text-muted-foreground">
                    {items.map((item, j) => (
                        <li key={j} className="flex gap-2.5">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400" />
                            <span>{item.replace(/^[-*] /, "")}</span>
                        </li>
                    ))}
                </ul>
            )
        }

        // Numbered list
        if (trimmed.match(/^\d+\. /)) {
            const items = trimmed.split("\n").filter(l => l.match(/^\d+\. /))
            return (
                <ol key={i} className="space-y-1.5 text-[15px] leading-relaxed text-muted-foreground">
                    {items.map((item, j) => (
                        <li key={j} className="flex gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-500/15 text-[11px] font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/25">
                                {j + 1}
                            </span>
                            <span className="pt-0.5">{item.replace(/^\d+\. /, "")}</span>
                        </li>
                    ))}
                </ol>
            )
        }

        // Code block
        if (trimmed.startsWith("```")) {
            const code = trimmed.replace(/^```[a-z]*\n?/, "").replace(/```$/, "")
            return (
                <pre key={i} className="neu-inset overflow-x-auto rounded-xl p-4 font-mono text-xs leading-relaxed text-foreground/85 scrollbar-thin">
                    {code}
                </pre>
            )
        }

        // Default paragraph
        return <p key={i} className="text-[15px] leading-relaxed text-muted-foreground/95">{trimmed}</p>
    })
}

export function LevelContent({
    content,
    videoUrl,
    duration,
}: {
    content?: string
    videoUrl?: string
    duration?: number
}) {
    const embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null
    const hasContent = content && content.trim().length > 0

    if (!hasContent && !embedUrl) {
        return (
            <section className="card-premium">
                <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-inset ring-indigo-500/20">
                        <BookOpen className="h-7 w-7 text-indigo-300/70" />
                    </span>
                    <p className="text-sm text-muted-foreground">No study materials for this level yet.</p>
                </div>
            </section>
        )
    }

    return (
        <section className="card-premium overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-white/8 px-6 py-4">
                <h2 className="font-display flex items-center gap-2 text-base font-semibold">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/25 to-violet-500/15 ring-1 ring-inset ring-indigo-500/30">
                        <BookOpen className="h-4 w-4 text-indigo-300" />
                    </span>
                    Study Material
                </h2>
                {duration ? (
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        {duration} min
                    </Badge>
                ) : null}
            </div>

            <div className="space-y-5 p-6">
                {/* Video embed */}
                {embedUrl ? (
                    <div className="relative overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/10 shadow-glow">
                        <div className="aspect-video">
                            <iframe
                                src={embedUrl}
                                title="Level video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="h-full w-full"
                            />
                        </div>
                    </div>
                ) : videoUrl ? (
                    <a
                        href={videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-3 rounded-xl border border-indigo-500/25 bg-indigo-500/10 p-4 transition-colors hover:border-indigo-500/45 hover:bg-indigo-500/15"
                    >
                        <PlayCircle className="h-9 w-9 shrink-0 text-indigo-300 transition-transform group-hover:scale-105" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">Watch the video lesson</p>
                            <p className="truncate text-xs text-muted-foreground">{videoUrl}</p>
                        </div>
                        <ExternalLink className="h-4 w-4 shrink-0 text-indigo-300" />
                    </a>
                ) : null}

                {/* Text content */}
                {hasContent && (
                    <article className="space-y-4 leading-relaxed">
                        {renderContent(content!)}
                    </article>
                )}
            </div>
        </section>
    )
}
