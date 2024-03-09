import { getUrlParam } from "../utils/helpers";

const amountMap = {
  "4k": [64, 64, 0.29],
  "8k": [128, 64, 0.42],
  "16k": [128, 128, 0.48],
  "32k": [256, 128, 0.55],
  "65k": [256, 256, 0.6],
  "131k": [512, 256, 0.85],
  "252k": [512, 512, 1.2],
  "524k": [1024, 512, 1.4],
  "1m": [1024, 1024, 1.6],
  "2m": [2048, 1024, 2],
  "4m": [2048, 2048, 2.5],
};

const useStats = false;
const isMobile = /(iPad|iPhone|Android)/i.test(navigator.userAgent);
const amount = getUrlParam("amount", "16k");
const motionBlurQuality = getUrlParam("motionBlurQuality", "low");
const amountInfo = amountMap[amount];
const query = { amount, motionBlurQuality };

const motionBlurQualityMap = {
  best: 1,
  high: 0.5,
  medium: 1 / 3,
  low: 0.25,
};

const options = {
  query,
  useStats,
  isMobile,
  amountMap,
  motionBlurQualityMap,
  amountList: Object.keys(amountMap),
  simulatorTextureWidth: amountInfo[0],
  simulatorTextureHeight: amountInfo[1],
  useTriangleParticles: true,
  followMouse: false,
  speed: 1,
  dieSpeed: 0.015,
  radius: 0.29 * 1.3,
  curlSize: 0.02,
  attraction: 1,
  shadowDarkness: 0.4,
  bgColor: "#666666",
  color1: "#FFFFFF",
  color2: "#FFFFFF",
  fxaa: false,
  motionBlurQualityList: Object.keys(motionBlurQualityMap),
  motionBlur: false,
  motionBlurPause: false,
  bloom: false,
};

export default options;
