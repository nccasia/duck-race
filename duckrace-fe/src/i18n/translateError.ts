import i18n from "./index";

interface ApiErrorPayload {
  errorCode?: string;
  errorMessage?: string;
}

export const translateError = (payload?: ApiErrorPayload | string | null): string => {
  if (!payload) {
    return i18n.t("errors.INTERNAL_SERVER_ERROR");
  }

  if (typeof payload === "string") {
    return translateError({ errorMessage: payload });
  }

  if (payload.errorCode) {
    return i18n.t(`errors.${payload.errorCode}`, {
      defaultValue: payload.errorMessage ?? i18n.t("errors.INTERNAL_SERVER_ERROR"),
    });
  }

  if (payload.errorMessage) {
    const asCode = i18n.t(`errors.${payload.errorMessage}`, { defaultValue: "" });
    if (asCode) {
      return asCode;
    }

    return payload.errorMessage;
  }

  return i18n.t("errors.INTERNAL_SERVER_ERROR");
};

export const translateTransactionNote = (note?: string | null): string => {
  if (!note) {
    return "";
  }

  return i18n.t(`transactions.${note}`, { defaultValue: note });
};
