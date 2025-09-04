export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          name: string;
          username: string;
          email: string;
          password: string;
          role: string;
          status: string;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          username: string;
          email: string;
          password: string;
          role: string;
          status: string;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          username?: string;
          email?: string;
          password?: string;
          role?: string;
          status?: string;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      employees: {
        Row: {
          id: string;
          id_badge_number: string;
          name: string;
          department: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          id_badge_number: string;
          name: string;
          department: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          id_badge_number?: string;
          name?: string;
          department?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      survey_responses: {
        Row: {
          id: string;
          name: string;
          id_badge_number: string;
          department: string;
          created_at: string;
          updated_at: string;

          hr_documentcontrol_question1: number;
          hr_documentcontrol_question2: number;
          hr_documentcontrol_feedback: string | null;

          hr_itsupport_question1: number;
          hr_itsupport_question2: number;
          hr_itsupport_feedback: string | null;

          environmental_monitoring_question1: number;
          environmental_monitoring_question2: number;
          environmental_monitoring_feedback: string | null;

          environmental_management_question1: number;
          environmental_management_question2: number;
          environmental_management_feedback: string | null;

          environmental_audit_question1: number;
          environmental_audit_question2: number;
          environmental_audit_feedback: string | null;

          environmental_study_question1: number;
          environmental_study_question2: number;
          environmental_study_feedback: string | null;

          external_communityrelations_question1: number;
          external_communityrelations_question2: number;
          external_communityrelations_feedback: string | null;

          external_assetprotection_question1: number;
          external_assetprotection_question2: number;
          external_assetprotection_feedback: string | null;

          external_govrel_question1: number | null;
          external_govrel_question2: number | null;
          external_govrel_feedback: string | null;

          scm_inventory_question1: number;
          scm_inventory_question2: number;
          scm_inventory_feedback: string | null;

          scm_procurement_question1: number;
          scm_procurement_question2: number;
          scm_procurement_feedback: string | null;

          hr_itfield_question1: number;
          hr_itfield_question2: number;
          hr_itfield_feedback: string | null;

          hr_siteservice_question1: number;
          hr_siteservice_question2: number;
          hr_siteservice_feedback: string | null;

          hr_peopledev_question1: number;
          hr_peopledev_question2: number;
          hr_peopledev_feedback: string | null;

          hr_comben_question1: number;
          hr_comben_question2: number;
          hr_comben_feedback: string | null;

          hr_translator_question1: number;
          hr_translator_question2: number;
          hr_translator_feedback: string | null;

          hr_talentacquisition_question1: number;
          hr_talentacquisition_question2: number;
          hr_talentacquisition_feedback: string | null;

          hr_ir_question1: number;
          hr_ir_question2: number;
          hr_ir_feedback: string | null;

          scm_logistic_question1: number;
          scm_logistic_question2: number;
          scm_logistic_feedback: string | null;

          scm_warehouse_question1: number;
          scm_warehouse_question2: number;
          scm_warehouse_feedback: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          id_badge_number: string;
          department: string;
          created_at?: string;
          updated_at?: string;

          hr_documentcontrol_question1: number;
          hr_documentcontrol_question2: number;
          hr_documentcontrol_feedback?: string | null;

          hr_itsupport_question1: number;
          hr_itsupport_question2: number;
          hr_itsupport_feedback?: string | null;

          environmental_monitoring_question1: number;
          environmental_monitoring_question2: number;
          environmental_monitoring_feedback: string | null;

          environmental_management_question1: number;
          environmental_management_question2: number;
          environmental_management_feedback: string | null;

          environmental_audit_question1: number;
          environmental_audit_question2: number;
          environmental_audit_feedback: string | null;

          environmental_study_question1: number;
          environmental_study_question2: number;
          environmental_study_feedback: string | null;

          external_communityrelations_question1: number;
          external_communityrelations_question2: number;
          external_communityrelations_feedback?: string | null;

          external_assetprotection_question1?: number;
          external_assetprotection_question2?: number;
          external_assetprotection_feedback?: string | null;

          external_govrel_question1?: number | null;
          external_govrel_question2?: number | null;
          external_govrel_feedback?: string | null;

          scm_inventory_question1?: number;
          scm_inventory_question2?: number;
          scm_inventory_feedback?: string | null;

          scm_procurement_question1?: number;
          scm_procurement_question2?: number;
          scm_procurement_feedback?: string | null;

          hr_itfield_question1: number;
          hr_itfield_question2: number;
          hr_itfield_feedback?: string | null;

          hr_siteservice_question1: number;
          hr_siteservice_question2: number;
          hr_siteservice_feedback?: string | null;

          hr_peopledev_question1: number;
          hr_peopledev_question2: number;
          hr_peopledev_feedback?: string | null;

          hr_comben_question1: number;
          hr_comben_question2: number;
          hr_comben_feedback?: string | null;

          hr_translator_question1: number;
          hr_translator_question2: number;
          hr_translator_feedback?: string | null;

          hr_talentacquisition_question1: number;
          hr_talentacquisition_question2: number;
          hr_talentacquisition_feedback?: string | null;

          hr_ir_question1: number;
          hr_ir_question2: number;
          hr_ir_feedback?: string | null;

          scm_logistic_question1: number;
          scm_logistic_question2: number;
          scm_logistic_feedback?: string | null;

          scm_warehouse_question1: number;
          scm_warehouse_question2: number;
          scm_warehouse_feedback?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          id_badge_number?: string;
          department?: string;
          created_at?: string;
          updated_at?: string;

          hr_documentcontrol_question1?: number;
          hr_documentcontrol_question2?: number;
          hr_documentcontrol_feedback?: string | null;

          hr_itsupport_question1?: number;
          hr_itsupport_question2?: number;
          hr_itsupport_feedback?: string | null;

          environmental_monitoring_question1?: number;
          environmental_monitoring_question2?: number;
          environmental_monitoring_feedback?: string | null;

          environmental_management_question1?: number;
          environmental_management_question2?: number;
          environmental_management_feedback?: string | null;

          environmental_audit_question1?: number;
          environmental_audit_question2?: number;
          environmental_audit_feedback?: string | null;

          environmental_study_question1?: number;
          environmental_study_question2?: number;
          environmental_study_feedback?: string | null;

          external_communityrelations_question1?: number;
          external_communityrelations_question2?: number;
          external_communityrelations_feedback?: string | null;

          external_assetprotection_question1?: number;
          external_assetprotection_question2?: number;
          external_assetprotection_feedback?: string | null;

          external_govrel_question1?: number | null;
          external_govrel_question2?: number | null;
          external_govrel_feedback?: string | null;

          scm_inventory_question1?: number;
          scm_inventory_question2?: number;
          scm_inventory_feedback?: string | null;

          scm_procurement_question1?: number;
          scm_procurement_question2?: number;
          scm_procurement_feedback?: string | null;

          hr_itfield_question1?: number;
          hr_itfield_question2?: number;
          hr_itfield_feedback?: string | null;

          hr_siteservice_question1?: number;
          hr_siteservice_question2?: number;
          hr_siteservice_feedback?: string | null;

          hr_peopledev_question1?: number;
          hr_peopledev_question2?: number;
          hr_peopledev_feedback?: string | null;

          hr_comben_question1?: number;
          hr_comben_question2?: number;
          hr_comben_feedback?: string | null;

          hr_translator_question1?: number;
          hr_translator_question2?: number;
          hr_translator_feedback?: string | null;

          hr_talentacquisition_question1?: number;
          hr_talentacquisition_question2?: number;
          hr_talentacquisition_feedback?: string | null;

          hr_ir_question1?: number;
          hr_ir_question2?: number;
          hr_ir_feedback?: string | null;

          scm_logistic_question1?: number;
          scm_logistic_question2?: number;
          scm_logistic_feedback?: string | null;

          scm_warehouse_question1?: number;
          scm_warehouse_question2?: number;
          scm_warehouse_feedback?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
