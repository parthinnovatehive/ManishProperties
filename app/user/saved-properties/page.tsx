import SavedPropertyCard from "@/components/user/SavedPropertyCard";

export default function SavedPropertiesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Saved Properties
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <SavedPropertyCard
          title="Luxury Villa"
          location="Mumbai"
          price="₹1.2 Cr"
        />

        <SavedPropertyCard
          title="Premium Apartment"
          location="Pune"
          price="₹85 Lakh"
        />

        <SavedPropertyCard
          title="Sea View Penthouse"
          location="Navi Mumbai"
          price="₹2.5 Cr"
        />

        <SavedPropertyCard
          title="Smart Home"
          location="Thane"
          price="₹95 Lakh"
        />

        <SavedPropertyCard
          title="Commercial Office"
          location="BKC"
          price="₹3.8 Cr"
        />

        <SavedPropertyCard
          title="Farm House"
          location="Lonavala"
          price="₹1.8 Cr"
        />
      </div>
    </div>
  );
}