import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

/** The home page runs the 3D journey, which only sets itself up on a full page load. */
const homePath = /^\/(tr|en)\/?(#.*)?$/;

const components: MDXComponents = {
  // The post page renders the only H1; a stray `#` in a post must not add a second one.
  h1: (props: ComponentPropsWithoutRef<"h1">) => <h2 {...props} />,
  a: ({ href = "", ...props }: ComponentPropsWithoutRef<"a">) => {
    if (homePath.test(href)) return <a href={href} {...props} />;
    if (href.startsWith("/") || href.startsWith("#")) return <Link href={href} {...props} />;
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
  },
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="post-table">
      <table {...props} />
    </div>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
