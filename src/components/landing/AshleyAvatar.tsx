import Image from "next/image";

export function AshleyAvatar({ size = 96 }: { size?: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full ring-2 ring-surface"
      style={{ width: size, height: size }}
    >
      <Image
        src="/ashley/ashley-cozy.jpg"
        alt="Ashley"
        fill
        sizes={`${size}px`}
        className="object-cover"
        style={{ objectPosition: "50% 22%" }}
      />
    </div>
  );
}
