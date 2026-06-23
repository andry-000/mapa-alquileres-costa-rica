import { useEffect, useState } from "react";
import { loadAtlas, type LoadedAtlas } from "../data/loaders";

export type AtlasDataState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | ({ status: "ready" } & LoadedAtlas);

/** Loads geometry + all metric artifacts once on mount. */
export function useAtlasData(): AtlasDataState {
  const [state, setState] = useState<AtlasDataState>({ status: "loading" });

  useEffect(() => {
    let alive = true;
    loadAtlas()
      .then((loaded) => alive && setState({ status: "ready", ...loaded }))
      .catch(
        (e: unknown) =>
          alive &&
          setState({ status: "error", error: e instanceof Error ? e.message : String(e) }),
      );
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
