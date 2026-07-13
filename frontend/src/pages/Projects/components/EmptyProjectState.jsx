import { PlusIcon } from '../../../components/icons'

export default function EmptyProjectState({ onCreateProject }) {
  return (
    <section className="relative mx-auto flex min-h-[620px] max-w-4xl items-center justify-center">
      <div className="w-full rounded-2xl border border-white/10 bg-[#121a27]/70 px-6 py-14 text-center shadow-[0_30px_80px_rgba(0,0,0,0.2)] backdrop-blur sm:px-12 sm:py-20">
        <div className="mx-auto mb-8 grid h-44 w-52 place-items-center rounded-2xl border border-dashed border-white/10 bg-[#131b27]">
          <div className="relative h-28 w-36 rounded-xl border border-white/5 bg-[#111822]">
            <span className="absolute -left-5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[#b4c5ff]/35 bg-[#17264a] text-[#b4c5ff]">
              <PlusIcon size={18} />
            </span>
            <span className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
            <span className="absolute -right-3 -top-3 h-8 w-8 rounded-md border border-white/10 bg-[#252427]" />
            <span className="absolute -bottom-3 left-5 h-7 w-14 rounded-md border border-white/10 bg-[#252427]" />
          </div>
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Chưa có dự án nào
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#c3c6d7] sm:text-lg">
          Tạo dự án đầu tiên của bạn để bắt đầu thiết kế, xây dựng và quản lý các
          Landing Page chuyên nghiệp.
        </p>
        <button
          type="button"
          onClick={onCreateProject}
          className="mx-auto mt-8 flex items-center justify-center gap-3 rounded-xl bg-[#eec200] px-8 py-4 text-lg font-bold text-[#231b00] shadow-[0_0_25px_rgba(238,194,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#ffe083] hover:shadow-[0_0_34px_rgba(238,194,0,0.4)] active:translate-y-0"
        >
          <PlusIcon size={21} />
          Tạo Project mới
        </button>
      </div>
    </section>
  )
}
