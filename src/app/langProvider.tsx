import { appWithTranslation } from "next-i18next";

import type { ChildrenType } from "@/@core/types";

const LanguageProvider = (({ children }: ChildrenType) => {
    return children;
})

export default appWithTranslation(LanguageProvider as any);
