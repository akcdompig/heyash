import Image from "next/image";

export function AshleyProfile() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <div className="overflow-hidden rounded-3xl bg-surface-tint sm:flex sm:items-stretch">
        <div className="relative mx-auto mt-8 h-56 w-44 shrink-0 overflow-hidden rounded-2xl shadow-soft sm:mx-0 sm:mt-0 sm:h-auto sm:w-56 sm:rounded-none sm:shadow-none">
          <Image
            src="/ashley/ashley-cozy.jpg"
            alt="Ashley, met een kop koffie en een boek"
            fill
            sizes="(min-width: 640px) 224px, 176px"
            className="object-cover"
            style={{ objectPosition: "50% 15%" }}
          />
        </div>
        <div className="p-8 sm:p-12">
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
    </section>
  );
}
