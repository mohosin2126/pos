export default function Title({
  title = "",
  description = "",
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center mb-14">
      <h2 className="text-4xl lg:text-5xl font-bold text-white mb-3">
        {title}
      </h2>
      <p className="text-[#a0aec0] max-w-md mx-auto">{description}</p>
      <div className="mx-auto mt-6 w-16 h-[2px] bg-[#4fe7c4]"></div>
    </div>
  );
}
