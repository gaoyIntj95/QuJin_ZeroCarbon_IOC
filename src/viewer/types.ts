export type ParkViewerMode = "overview" | "energy" | "carbon";

export type ViewerPosition = {
  x: number;
  y: number;
  z?: number;
};

export type Enterprise = {
  enterpriseId: string;
  name: string;
  position: ViewerPosition;
  industry: string;
  park: string;
  isKeyEnterprise: boolean;
  isGreenFactory: boolean;
  isZeroCarbonFactory: boolean;
  energy: number;
  carbon: number;
  intensity: number;
  green: number;
  reduction: number;
};

export type Facility = {
  facilityId: string;
  name: string;
  type:
    | "substation"
    | "solar"
    | "wind"
    | "storage"
    | "greenLink"
    | "gas"
    | "heat";
  position: ViewerPosition;
  info: string;
};

export type ParkBuilding = {
  buildingId: string;
  name: string;
  type: "factory" | "office" | "service" | "utility";
  position: ViewerPosition;
  width: number;
  depth: number;
  height: number;
  enterpriseId?: string;
  hasSolarRoof?: boolean;
};

export type EnergyFlow = {
  flowId: string;
  sourceId: string;
  targetId: string;
  energyType: "electric" | "green" | "gas" | "heat";
  value: number;
};

export type CarbonRegion = {
  regionId: string;
  enterpriseId: string;
  position: ViewerPosition;
  intensity: number;
};

export type ParkViewerData = {
  buildings: ParkBuilding[];
  enterprises: Enterprise[];
  facilities: Facility[];
  energyFlows: EnergyFlow[];
  carbonRegions: CarbonRegion[];
};
