"use client";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/course");

  return (
    <>
      <Header showBack={false} />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary p-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-center text-foreground animate-fade-in">
              Interactive Learning Platform
            </h1>
            <p className=" text-base text-center text-muted-foreground max-w-2xl mx-auto">
              Choose your preferred learning method and embark on your
              educational journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <Link
              href="/voice"
              className="transform transition-all duration-300 hover:scale-[1.02]"
            >
              <Card className="group h-full border-2 hover:border-primary/50 hover:bg-primary/5">
                <CardContent className="p-8 flex flex-col items-center space-y-6">
                  <div className="p-6 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 transform group-hover:scale-110">
                    <MessageSquare className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h2 className="text-base font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Voice Chat Bot
                  </h2>
                  <p className="text-center text-muted-foreground">
                    Experience dynamic learning through natural conversations
                    with our AI-powered chat bot
                  </p>
                  <Button
                    variant="default"
                    className="bg-primary/90 hover:bg-primary group-hover:translate-x-2 transition-all duration-300"
                  >
                    Start Chat{" "}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link
              href="/course"
              className="transform transition-all duration-300 hover:scale-[1.02]"
            >
              <Card className="group h-full border-2 hover:border-primary/50 hover:bg-primary/5">
                <CardContent className="p-8 flex flex-col items-center space-y-6">
                  <div className="p-6 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 transform group-hover:scale-110">
                    <GraduationCap className="w-10 h-10 text-purple-500 dark:text-purple-400" />
                  </div>
                  <h2 className="text-base font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Course Tutor Bot
                  </h2>
                  <p className="text-center text-muted-foreground">
                    Follow structured learning paths with our AI-powered course
                    assistant
                  </p>
                  <Button
                    variant="default"
                    className="bg-primary/90 hover:bg-primary group-hover:translate-x-2 transition-all duration-300"
                  >
                    Start Learning{" "}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
