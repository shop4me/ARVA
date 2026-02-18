import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-neutral max-w-none prose-a:text-arva-accent prose-a:no-underline hover:prose-a:underline prose-p:leading-7">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const url = href ?? "";
            if (url.startsWith("/")) {
              return <Link href={url}>{children}</Link>;
            }
            return (
              <a href={url} rel="noopener noreferrer" target="_blank">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

