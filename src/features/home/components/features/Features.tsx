import RentBg from "@/assets/features/rent-feat.png";
import RepairBg from "@/assets/features/repair-feat.png";
import BrandNewBg from "@/assets/features/brand-new-feat.png";
import RefubishedBg from "@/assets/features/refurbished-feat.png";
import FeatureCard from "./FeatureCard";

export default function Features() {
    return (
        <section className="flex flex-col items-center justify-center w-full mt-[30px] md:mt-[50px]">
            <div className="w-[95%] md:w-[90%] flex flex-col items-start justify-start mb-[15px] md:mb-[20px]">
                <h2 className="text-[22px] sm:text-[26px] md:text-[30px] font-bold">More Than Just a Store</h2>
                <p className="text-gray-600 text-[14px] md:text-[16px]">We support your tech at every stage - from buying new to expert repairs and easy trade-ins.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 w-[95%] md:w-[90%]">
                <FeatureCard title="Rent" bg={RentBg} />
                <FeatureCard title="Repair" bg={RepairBg} />
                <FeatureCard title="Brand New" bg={BrandNewBg} />
                <FeatureCard title="Refurbished" bg={RefubishedBg} />
            </div>
        </section>
    );
}
