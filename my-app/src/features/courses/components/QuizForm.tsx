"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ClipboardList, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Quiz } from "../types"

export function QuizForm({
    quiz,
    onSubmitResult,
}: {
    quiz: Quiz
    // Updated signature: accepts answers map or raw result,
    // but for compatibility with LevelDetailPage let's keep the prop generic
    // and handle the data flow inside handleSubmit.
    // Actually, we'll change specific prop type in usage.
    // But to avoid breaking TS build let's use 'any' for the function callback temporarily
    // or define strict type if we update parent simultaneously.
    onSubmitResult: (answers: Record<string, string>) => void
}) {
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [submitted, setSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            await onSubmitResult(answers)
            setSubmitted(true)
        } catch (error) {
            console.error("Quiz submission failed", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const total = quiz.questions.length
    const answeredCount = Object.keys(answers).length
    const allAnswered = answeredCount >= total
    const completionPct = total > 0 ? (answeredCount / total) * 100 : 0
    const optionLetters = ["A", "B", "C", "D", "E", "F", "G", "H"]

    return (
        <section className="gradient-border overflow-hidden">
            <div className="relative">
                {/* Header */}
                <div className="border-b border-white/8 p-5">
                    <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/25 to-indigo-500/15 ring-1 ring-inset ring-violet-500/30">
                            <ClipboardList className="h-4 w-4 text-violet-300" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-display truncate text-lg font-semibold">{quiz.title}</h3>
                            {quiz.description && (
                                <p className="truncate text-sm text-muted-foreground">{quiz.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="mt-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-muted-foreground">
                                {answeredCount} of {total} answered
                            </span>
                            <span className="font-semibold tabular-nums text-violet-300">
                                {Math.round(completionPct)}%
                            </span>
                        </div>
                        <div
                            className="h-1.5 w-full overflow-hidden rounded-full bg-white/8"
                            role="progressbar"
                            aria-valuenow={answeredCount}
                            aria-valuemin={0}
                            aria-valuemax={total}
                            aria-label="Quiz completion"
                        >
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 transition-all duration-500 ease-out"
                                style={{ width: `${completionPct}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-5 p-5">
                    {quiz.questions.map((q, idx) => {
                        const selected = answers[q.id]
                        return (
                            <motion.fieldset
                                key={q.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-subtle rounded-2xl border border-white/8 p-4"
                            >
                                <legend className="sr-only">{q.prompt}</legend>
                                <p className="mb-3 flex items-start gap-2 font-medium text-foreground">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/15 text-xs font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/25">
                                        {idx + 1}
                                    </span>
                                    <span className="pt-0.5">{q.prompt}</span>
                                </p>
                                <div className="space-y-2">
                                    {q.options.map((opt, optIdx) => {
                                        const isChosen = selected === opt.id
                                        return (
                                            <label
                                                key={opt.id}
                                                className={cn(
                                                    "group/opt flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all duration-200",
                                                    "neu-pressable",
                                                    isChosen
                                                        ? "border-indigo-400/60 ring-1 ring-inset ring-indigo-400/40"
                                                        : "border-white/8 hover:border-indigo-400/30",
                                                    (submitted || isSubmitting) && "cursor-not-allowed opacity-80"
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name={q.id}
                                                    value={opt.id}
                                                    checked={answers[q.id] === opt.id}
                                                    onChange={() => setAnswers({ ...answers, [q.id]: opt.id })}
                                                    disabled={submitted || isSubmitting}
                                                    className="sr-only"
                                                />
                                                <span
                                                    className={cn(
                                                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                                                        isChosen
                                                            ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-glow"
                                                            : "bg-white/5 text-muted-foreground ring-1 ring-inset ring-white/10 group-hover/opt:text-indigo-300"
                                                    )}
                                                >
                                                    {isChosen ? <CheckCircle2 className="h-4 w-4" /> : optionLetters[optIdx] ?? optIdx + 1}
                                                </span>
                                                <span className={cn("text-sm", isChosen ? "font-medium text-foreground" : "text-foreground/90")}>
                                                    {opt.text || opt.optionText}
                                                </span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </motion.fieldset>
                        )
                    })}

                    {!submitted && (
                        <Button
                            onClick={handleSubmit}
                            variant="glow"
                            size="lg"
                            className="w-full"
                            disabled={Object.keys(answers).length < quiz.questions.length || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Submitting…
                                </>
                            ) : allAnswered ? (
                                "Submit Quiz"
                            ) : (
                                `Answer all ${total} questions`
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </section>
    )
}
