"use client";

import dynamic from "next/dynamic";

const PropertyMapClient = dynamic(
  () => import("./property-map-client"),
  {
    ssr: false,
  }
);

type Props = {
  lat: number;
  lng: number;
  title: string;
};

export function PropertyMap(props: Props) {
  return <PropertyMapClient {...props} />;
}