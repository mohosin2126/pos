import Title from "@/components/title";

export default function CommonBanner({
  title = "",
  description = "",
  className = "bg-[#0b111a]",
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full h-72 flex flex-col items-center justify-center relative ${className}`}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(79,231,196,0.15),_transparent_70%)]"></div>
      <Title title={title} description={description} />
    </div>
  );
}
