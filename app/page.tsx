import Link from "next/link";
import { Button } from "@/components/ui/button";
import DefaultLayout from "@/components/layout/DefaultLayout";

export default function Home() {
  return (
    <DefaultLayout >
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-industrial-black mb-6">
          Industrial Electrical Equipment
        </h1>
        <p className="text-lg text-slate-gray max-w-2xl mb-8">
          Providing high-precision measuring instruments, automation solutions, and electrical components for industrial applications.
        </p>
        <div className="flex gap-4">
          <Button asChild className="bg-electric-orange hover:bg-orange-600 text-white font-semibold px-8 py-6 rounded-md">
            <Link href="/products">View Products</Link>
          </Button>
          <Button asChild variant="outline" className="border-slate-200 text-industrial-black hover:bg-slate-50 font-semibold px-8 py-6 rounded-md">
            <Link href="/contact">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </DefaultLayout >
  );
}
