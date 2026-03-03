import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize(process.env.NEXT_PUBLIC_GA_ID);
};

export const trackPage = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};
