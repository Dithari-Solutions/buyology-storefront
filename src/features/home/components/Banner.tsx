import Banner from "@/assets/banner/banner.svg";

export default function HeroSection() {
    return (
        <section
            className="
        w-full
        min-h-[400px]
        md:min-h-[500px]
        lg:min-h-[700px]
        flex
        flex-col
        md:flex-row
        items-center
        justify-center
        gap-10
        px-6
        md:px-16
        py-10
        mt-12
      "
            style={{
                backgroundImage: `url(${Banner.src})`,
                backgroundPosition: "center",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="text-center md:text-left max-w-sm">
                <p className="text-xl md:text-2xl lg:text-3xl font-semibold">
                    Desktop Computer
                </p>
                <p className="text-sm md:text-base text-gray-600 mt-2">
                    High performance for home and office
                </p>
            </div>

            <div className="text-center md:text-left max-w-sm">
                <p className="text-xl md:text-2xl lg:text-3xl font-semibold">
                    Tablet
                </p>
                <p className="text-sm md:text-base text-gray-600 mt-2">
                    For reading, drawing, and entertainment
                </p>
            </div>

            <div className="text-center md:text-left max-w-sm">
                <p className="text-xl md:text-2xl lg:text-3xl font-semibold">
                    Laptop
                </p>
                <p className="text-sm md:text-base text-gray-600 mt-2">
                    Perfect for work, study, and travel
                </p>
            </div>
        </section>
    );
}
