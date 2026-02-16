import Link from "next/link";
import { Module } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ModuleCardProps {
  module: Module;
}

export function ModuleCard({ module: mod }: ModuleCardProps) {
  const isAvailable = !mod.comingSoon && mod.lessons.length > 0;

  const content = (
    <CardHeader>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{mod.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">{mod.title}</CardTitle>
            {isAvailable ? (
              <Badge variant="secondary">{mod.lessons.length} lessons</Badge>
            ) : (
              <Badge variant="outline">Coming Soon</Badge>
            )}
          </div>
          <CardDescription className="mt-1">{mod.description}</CardDescription>
        </div>
      </div>
    </CardHeader>
  );

  if (isAvailable) {
    return (
      <Link href={`/learn/${mod.slug}`}>
        <Card className="transition-colors hover:bg-accent/50">{content}</Card>
      </Link>
    );
  }

  return <Card className="opacity-60">{content}</Card>;
}
