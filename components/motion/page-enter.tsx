"use client";

import type { PageHeaderProps } from "@/components/layout/page-shell";
import { PageContentMotion } from "@/components/motion/page-content-motion";
import { PageHeaderMotion } from "@/components/motion/page-header-motion";

type PageEnterProps = {
  header: PageHeaderProps;
  children: React.ReactNode;
  contentClassName?: string;
  contentDelay?: number;
};

export function PageEnter({ header, children, contentClassName, contentDelay }: PageEnterProps) {
  return (
    <>
      <PageHeaderMotion {...header} />
      <PageContentMotion className={contentClassName} delay={contentDelay}>
        {children}
      </PageContentMotion>
    </>
  );
}
