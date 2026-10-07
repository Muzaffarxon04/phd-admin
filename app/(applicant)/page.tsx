import ApplicantHome from "@/components/applicant/landing/ApplicantHome";

// Landing page. Kept as a server component that renders the client landing component:
// using the "use client" module directly as the page made `next build` fail to find it
// in the React client manifest.
export default function Page() {
  return <ApplicantHome />;
}
