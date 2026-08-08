import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { render } from "takumi-pdf";

import resume from "../../data/resume.json";
import { PageFooter } from "./components/PageFooter";
import { ResumeDocument } from "./ResumeDocument";
import { resumeStylesheets } from "./stylesheets";

const outputPath = resolve(process.cwd(), "public", "andrii-shafar-resume.pdf");

async function generateResumePdf() {
  const pdf = await render(<ResumeDocument resume={resume} />, {
    size: "a4",
    margin: { top: 38, right: 42, bottom: 42, left: 42 },
    stylesheets: resumeStylesheets,
    footer: <PageFooter />,
    outline: true,
    lang: "en",
    metadata: {
      title: "Andrii Shafar - Software Engineer and Applied Researcher",
      description: "Professional resume for Andrii Shafar",
      authors: ["Andrii Shafar"],
      keywords: ["software engineer", "product engineering", "Go", "Python", "TypeScript", "AI systems"],
      creator: "takumi-pdf 0.4.2 with React 19",
      creationDate: "2026-08-08",
    },
  });

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, pdf);
  console.log(`Generated ${outputPath} (${pdf.byteLength.toLocaleString()} bytes)`);
}

generateResumePdf().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
