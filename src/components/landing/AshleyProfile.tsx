import { AshleyAvatar } from "@/components/landing/AshleyAvatar";

export function AshleyProfile() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <div className="rounded-3xl bg-surface-tint p-8 sm:p-12">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
          <AshleyAvatar size={88} />
          <div>
            <h2 className="font-display text-2xl">Wie is Ashley?</h2>
            <p className="mt-3 leading-relaxed text-muted">
              Ashley is degene met wie je praat op Even Kletsen — een echt
              mens, geen script en geen chatbot. Ze luistert graag, stelt
              vragen als dat past, en laat het gesprek gaan waar jij het heen
              wilt. De ene keer is het licht en grappig, de andere keer wat
              dieper. Dat mag allebei.
            </p>
            <p className="mt-3 leading-relaxed text-muted">
              Ashley is er niet om je te behandelen of te adviseren als
              professional — daarvoor is ze niet opgeleid, en dat is ook niet
              waar Even Kletsen voor bedoeld is. Ze is er gewoon om te
              kletsen, zoals een vriend dat zou doen.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
