import { api } from "../api";
import { renderPreview } from "@/src/components/app/account/clientNotifications/templates/tokenText/renderPreview";
import type { RootState } from "@/src/store/redux/store";
import type {
  NotificationTemplateKind,
  GetNotificationTemplatesResponse,
  GetNotificationTemplateVariablesResponse,
  SaveNotificationTemplatePayload,
  SaveNotificationTemplateResponse,
  PreviewNotificationTemplatePayload,
  PreviewNotificationTemplateResponse,
  ResetNotificationTemplateResponse,
} from "@/src/store/redux/services/api-types";

export const notificationTemplatesApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getNotificationTemplates: builder.query<
      GetNotificationTemplatesResponse,
      number
    >({
      query: (userId) => ({
        url: `/users/${userId}/notification_templates`,
        method: "GET",
      }),
      providesTags: ["NotificationTemplates"],
    }),

    getNotificationTemplateVariables: builder.query<
      GetNotificationTemplateVariablesResponse,
      NotificationTemplateKind
    >({
      query: (kind) => ({
        url: `/notification_template_variables`,
        method: "GET",
        params: { kind },
      }),
    }),

    saveNotificationTemplate: builder.mutation<
      SaveNotificationTemplateResponse,
      SaveNotificationTemplatePayload
    >({
      query: ({ userId, kind, channel, body }) => ({
        url: `/users/${userId}/notification_templates`,
        method: "POST",
        data: { notification_template: { kind, channel, body } },
      }),
      async onQueryStarted(
        { userId, kind },
        { dispatch, getState, queryFulfilled },
      ) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (!data) return;

        const variablesState =
          notificationTemplatesApi.endpoints.getNotificationTemplateVariables.select(
            kind,
          )(getState() as RootState).data?.notification_template_variables;

        dispatch(
          notificationTemplatesApi.util.updateQueryData(
            "getNotificationTemplates",
            userId,
            (draft) => {
              const row = draft.notification_templates.find(
                (r) => r.kind === kind,
              );
              if (!row) return;
              row.is_custom = true;
              row.channel = data.notification_template.channel;
              row.body = data.notification_template.body;
              row.preview = variablesState
                ? renderPreview(data.notification_template.body, variablesState)
                : row.preview;
            },
          ),
        );
      },
    }),

    resetNotificationTemplate: builder.mutation<
      ResetNotificationTemplateResponse,
      { userId: number; kind: NotificationTemplateKind }
    >({
      query: ({ userId, kind }) => ({
        url: `/users/${userId}/notification_templates/reset`,
        method: "DELETE",
        params: { kind },
      }),
      async onQueryStarted({ userId, kind }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (!data) return;

        dispatch(
          notificationTemplatesApi.util.updateQueryData(
            "getNotificationTemplates",
            userId,
            (draft) => {
              const index = draft.notification_templates.findIndex(
                (r) => r.kind === kind,
              );
              if (index !== -1) {
                draft.notification_templates[index] =
                  data.notification_template;
              }
            },
          ),
        );
      },
    }),

    previewNotificationTemplate: builder.mutation<
      PreviewNotificationTemplateResponse,
      PreviewNotificationTemplatePayload
    >({
      query: ({ userId, kind, body }) => ({
        url: `/users/${userId}/notification_templates/preview`,
        method: "POST",
        data: { body, kind },
      }),
    }),
  }),
});

export const {
  useGetNotificationTemplatesQuery,
  useGetNotificationTemplateVariablesQuery,
  useSaveNotificationTemplateMutation,
  useResetNotificationTemplateMutation,
  usePreviewNotificationTemplateMutation,
} = notificationTemplatesApi;
