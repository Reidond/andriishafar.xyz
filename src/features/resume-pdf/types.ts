import resume from "../../data/resume.json";

export type ResumeData = typeof resume;
export type ResumeProfile = ResumeData["profile"];
export type ResumeMetric = ResumeData["metrics"][number];
export type Experience = ResumeData["experience"][number];
export type Project = ResumeData["projects"][number];
export type Education = ResumeData["education"];
export type Publication = ResumeData["publications"][number];
export type SocialLink = ResumeData["socialLinks"][number];
