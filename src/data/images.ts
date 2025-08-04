import dep1_img from "@/assets/dep1_sec1.png";
import env_audit from "@/assets/env-audit.png"
import env_study from "@/assets/env-study.png"
import env_mgt from "@/assets/env-mgt.png"
import env_mon from "@/assets/env-mon.png"
import env_audit_chart from "@/assets/env-audit-chart.png"
import env_mgt_chart from "@/assets/env-mgt-chart.png"
import env_mon_chart from "@/assets/env-mon-chart.png"
import env_study_chart from "@/assets/env-study-chart.png"
import ea_ap_chart from "@/assets/ea-ap-chart.jpg"
import ea_ap from "@/assets/ea-ap.jpg"
import ea_csr_chart from "@/assets/ea-csr-chart.jpeg"
import ea_csr from "@/assets/ea-csr.jpeg"
import ea_govrel_chart from "@/assets/ea-govrel-chart.png"
import ea_govrel from "@/assets/ea-govrel.jpeg"
import hr_ta from "@/assets/hr-ta.png"
import hr_translator from "@/assets/hr-translator.png"
import hr_pd from "@/assets/hr-pd.jpg"
import hr_ss from "@/assets/hr-ss.png"
import hr_ir from "@/assets/hr-ir.png"
import hr_cnb from "@/assets/hr-cnb.png"
import hr_ta_chart from "@/assets/hr-ta-chart.png"
import hr_translator_chart from "@/assets/hr-translator-chart.png"
import hr_ir_chart from "@/assets/hr-ir-chart.png"
import hr_cnb_chart from "@/assets/hr-cnb-chart.png"
import hr_pd_chart from "@/assets/hr-pd-chart.png" 
import hr_ss_chart from "@/assets/hr-ss-chart.png"
import ict_dc from "@/assets/ict-dc.png"
import ict_dc_chart from "@/assets/ict-dc-chart.png"
import ict_infra from "@/assets/ict-infra.png"
import ict_infra_chart from "@/assets/ict-infra-chart.png"
import ict_support from "@/assets/ict-support.png"
import ict_support_chart from "@/assets/ict-support-chart.png"

export const departmentSections = {
  Environmental: {
    sections: ["Monitoring", "Management", "Audit & Compulsory", "Study & Project"],
    images: {
      "Monitoring": {
        overview:
          `This section is responsible for monitoring various environmental parameters, including domestic and industrial wastewater, groundwater, ambient air, noise, odor, emissions from generators, stacks, and mobile sources, as well as TCLP testing. It also oversees the operation of supporting fleets such as vacuum trucks and water trucks, and implements internal inspection initiatives through the Environmental Inspection Program (Eco Hero).`,
        team: {
          src: env_mon,
          description: "Environmental Monitoring: Mahrivai B Hamisi, Jate’us Posmariano, Alexander Thefendio P.",
        },
        result: {
          src: env_mon_chart,
          description: "Environmental Monitoring - Work summary charts and metrics",
        },
      },
      "Management": {
        overview:
          `The Management section focuses on the handling and transportation of various waste streams, including hazardous waste (B3), domestic waste, inert waste, and metal scrap. This ensures that all waste is managed safely, efficiently, and in full compliance with environmental standards.`,
        team: {
          src: env_mgt,
          description: "Environmental Management: Syahrul Gunawan",
        },
        result: {
          src: env_mgt_chart,
          description: "Environmental Management - Work summary charts and metrics",
        },
      },
      "Audit & Compulsory": {
        overview:
          `This section handles environmental audits such as ISO audits, AEPR audits, lender (bank) audits, and government-conducted audits. It also manages the submission of mandatory environmental reports to the Ministry of Environment through electronic systems such as SIMPEL KLH, including Festronic and APPEL platform`,
        team: {
          src: env_audit,
          description: "Environmental Audit & Compulsory: Iman Abdul R, Tio Katarina Marapaung​.",
        },
        result: {
          src: env_audit_chart,
          description: "Environmental Audit & Compulsory - Work summary charts and metrics",
        },
      },
      "Study & Project": {
        overview:
          `The Study & Project section leads environmental assessments and the development of environmental initiatives, including environmental permits and technical studies (Pertek), as well as greening and conservation programs such as mangrove restoration and hydroseeding. This section also organizes environmental campaigns and events to raise awareness and engage stakeholders.`,
        team: {
          src: env_study,
          description: "Environmental Study & Project: Veronica A. Saragih​",
        },
        result: {
          src: env_study_chart,
          description: "Environmental Study & Project - Work summary charts and metrics",
        },
      },

    },
  },
  "Human Resources": {
    sections: [
      "Document Control",
      "ICT System & Support",
      "ICT Infrastructure & Network Security",
      "Site Service",
      "People Development",
      "Compensation & Benefit",
      "Translator",
      "Talent Acquisition",
      "Industrial Relation",
    ],
    images: {
      "Document Control": {
        overview:
          `The Document Controller Team under HRGA Department sub section Information & Communication Technology, plays a critical role in ensuring systematic, compliant, and secure document management across the organization. Responsibilities include maintaining document accuracy, version control, and accessibility while upholding quality standards and regulatory compliance. The team safeguards sensitive information, manages secure archiving, and coordinates document approvals and revisions. It also supports ICT-related procurement, budgeting input, and asset inventory, ensuring timely coordination with internal and external stakeholders. By adopting best practices and document technologies, the team enhances operational efficiency and mitigates compliance risks, contributing to strong governance and business continuity.`,
        team: {
          src: ict_dc,
          description:
            "ICT Team - Document Control: Adriana Riska Rante, Renitriana Br Sitepu.",
        },
        result: {
          src: ict_dc_chart,
          description: "Document Control Work Resume YTD January – June 2025",
        },
      },
      "ICT System & Support": {
        overview:
          `The ICT System & Support Team under HRGA Department sub section Information & Communication Technology, provides end-to-end technical support, manages system performance, maintains hardware and software assets, and implements IT policies to ensure smooth operations across the organization. Their responsibilities include resolving technical issues, supporting users, maintaining end device (hardware and software)and server availability, and safeguarding data through proactive security measures. They also contribute to system improvements and technology adoption to enhance operational efficiency. The team enables employees to work productively and securely. Their proactive and responsive approach ensures minimal downtime, high user satisfaction, and continuous support for the company’s digital operations.`,
        team: {
          src: ict_support,
          description: "ICT Team - ICT System & Support: Widji Santoso, Mahathir Muhammad, Peggy Leksana Putra Mangera, Andre Febrian Saputra.",
        },
        result: {
          src: ict_support_chart,
          description: "IT System & Support Work Resume YTD January - June 2025",
        },
      },
      "ICT Infrastructure & Network Security": {
        overview: `The ICT Infrastructure & Network Security Team under HRGA Department sub section Information & Communication Technology, plays a critical role in ensuring the availability, reliability, and security of the organization’s IT Network systems and infrastructure. This team responsible for planning, maintaining, and optimizing core technologies including network systems, CCTV, access control, radio communication, and master television. Hands-on technical support and strategic oversight to secure digital assets against evolving threats. Their responsibilities also include implementing IT security policies and compliance with company standards. They work collaboratively to deliver seamless connectivity, minimize downtime, and respond swiftly to technical incidents. With a strong focus on operational excellence, this team supports business continuity and drives continuous ICT Infrastructure expansion across the IT landscape by integrating emerging technologies and improving infrastructure performance.`,
        team: {
          src: ict_infra,
          description: "ICT Team - ICT Infrastructure & Network Security: Reza Rezki Ramdan, Arief Putro Prakoso, Hendrawan Setyo Pambudi.",
        },
        result: {
          src: ict_infra_chart,
          description: "ICT Infrastructure & Network Security Work Resume YTD January – June 2025",
        },
      },
      "Site Service": {
        overview:
          `Camp Service: 
          •	Focused on managing residential facilities for employees, especially in remote operational areas, this section ensures that living conditions meet company standards and contribute to employee well-being.
          •	Camp maintenance, accommodation allocation, recreational facilities management, basic amenities provisioning.
          Transport & Ticketing: 
          •	This section coordinates transportation needs for the organization, managing the logistics of employee travel and commuting. It ensures efficient, safe, and timely travel arrangements for employee and visitor.
          •	Employee transport management, travel booking and ticketing, vehicle maintenance, travel policy compliance.`,
        team: {
          src: hr_ss,
          description: "Site Service Team : Maulidha Prasetiyo, Ahmad Fauzi, Aryo Wanadri Bahariantomo, Diza Laila Barokah, Eka Izdihar Hafizhah, Faiz Al Farizah, Joshua Hein Hendrik Lumintang & Muchammad Rezqi Zunove.",
        },
        result: {
          src: hr_ss_chart,
          description: "Site Service Ticketing",
        },
      },
      "People Development": {
        overview:
          `•	This section is dedicated to fostering employee growth and professional development through targeted training programs and robust assessment methods. It designs and implements educational and development initiatives that align with organizational goals, ensuring that employees have the necessary skills and knowledge to advance in their careers. This section also evaluates the effectiveness of these programs to continuously refine learning opportunities and methodologies.
          •	Training programs, training need analysis, performance management, competency assessments, certification management, Organizational Development.`,
        team: {
          src: hr_pd,
          description: "People Development Team: Muh Irfan & Riska Novitasari Resdiansah.",
        },
        result: {
          src: hr_pd_chart,
          description: "People Development Work Matrix.",
        },
      },
      "Compensation & Benefit": {
        overview:
          `•	Tasked with designing and administering employee compensation and benefits, this section ensures competitive and equitable remuneration to attract and retain talent while complying with regulatory requirements.
          •	Salary and benefits administration, regulatory compliance, health insurance management, incentive programs.`,
        team: {
          src: hr_cnb,
          description: "Compensation & Benefit Team : Liberty Malsi, Astrifo Kabangnga, Isma'ilia Khoirun Nasta'in & Obed Pwiyii.",
        },
        result: {
          src: hr_cnb_chart,
          description: "Work Report",
        },
      },
      Translator: {
        overview:
          `•	Supporting global workforce operations, this section provides translation and interpretation services for operations materials, ensuring all employees have access to information in their preferred language.
          •	Document translation, real-time interpretation, localization of communication materials, multilingual support.`,
        team: {
          src: hr_translator,
          description: "Translator Team : Ach Sukhaemi Kurniawan, Achmad Chabibulloh, Alex William Pangestu, Alfares Christian, Ayu Nirmala, Dimas Alifando Wasa, Ezra Dea Kristianto, Gerasimos Aria Junianto, Hendri Setiyawan, Hudiono Alim, Muhamad Dafa Santoso, Nizamul Anam, Nur Rohman Mauluddin, Nurul Hasanah, Reyhan Dayu Ramadhani, Ronaldo Cliford Wolah, Sultan Jorgi & Willy.",
        },
        result: {
          src: hr_translator_chart,
          description: "Translation work matrix",
        },
      },
      "Talent Acquisition": {
        overview:
          `•	As the gateway for new talent, this section handles all aspects of the recruitment process from sourcing candidates to hiring. It focuses on aligning talent acquisition strategies with business needs to attract and retain high-quality employees.
          •	Recruitment planning, candidate screening, interviewing, onboarding, employer branding.`,
        team: {
          src: hr_ta,
          description: "Talent Acquisition Team : Ade Prastya Nugraha, Alvin Andrean Syahputra, Maulana Ihsan Rurianda & Novia Indri Yanti Yunitazami.",
        },
        result: {
          src: hr_ta_chart,
          description: "Recruitment team work matrix.",
        },
      },
      "Industrial Relation": {
        overview:
          `•	This section manages the relationship between the organization and its workforce, particularly focusing on labour interactions and employee grievances. It aims to foster a harmonious work environment through fair practices and effective dispute resolution.
          •	Grievance handling, labour law compliance, mediation and arbitration.`,
        team: {
          src: hr_ir,
          description: "Industrial Relation Team : Ade Prastya Nugraha, M Abdullah Najib & Rezkita Bagas Prakasih.",
        },
        result: {
          src: hr_ir_chart,
          description: "Industrial Team Report.",
        },
      },
    },
  },
  "External Affair": {
    sections: ["Asset Protection", "Community Relations", "Government Relations"],
    images: {
      "Asset Protection": {
        overview:
          `Security & Asset Protection, in the task of securing tangible and intangible assets, is based on security risk management, considering both external and internal factors. The implementation of PDCA-Six Sigma in business processes begins at the beginning, during, and after the process is running, utilizing three main components: people, technology, and systems. The target of asset vulnerability protection for managed risks is also people, technology, systems/business processes, and reputation.`,
        team: {
          src: ea_ap,
          description: "Asset Protection Team (Left to Right): Herdiman Sirait, Indra Maulana, Yuli Yendra.",
        },
        result: {
          src: ea_ap_chart,
          description: "Work Summary Matrix Asset Protection Semester 1 - 2025",
        },
      },
      "Community Relations": {
        overview:
          `Community Relations is a strategic unit within the Department of External Affairs under the Support Services Division. This function is responsible for managing harmonious relationships with society, planning and executing corporate social responsibility programs. The team is also responsible for managing communication with external communities to maintain a conducive and improve the company's reputation. Through stakeholder mapping to mitigation and resolution conflict in the community. Community Relations ensures that PT Merdeka Tsingshan Indonesia can contribute to the sustainability of society.`,
        team: {
          src: ea_csr,
          description: "Community Relations Team (Left to Right): Ardian Aji Megantoro, Heikal, Novaludin.",
        },
        result: {
          src: ea_csr_chart,
          description:`Skor kinerja Community Relations yang dihitung dengan rata-rata tertimbang dari lima indikator utama:
          1.) Stakeholder Engagement & Mapping
          2.) Conflict Identification, Mitigation and Resolution
          3.) Implementation of TJSL Programs
          4.) Implementation SROI.`,
        },
      },
      "Government Relations": {
        overview:
          `Government Relations is a strategic unit within the External Affairs Department under the Support Services Division. This function is responsible for managing institutional relationships, ensuring compliance with regulatory frameworks, and advocating for the company’s operational interests across all levels of government and relevant stakeholders. The team facilitates all licensing and certification processes, supports legal and occupational safety compliance, and proactively engages with stakeholders especially government authorities to maintain conducive working environments and enhance corporate reputation. Through ongoing stakeholder mapping, field coordination, and regulatory tracking, Government Relations ensures that PT Merdeka Tsingshan Indonesia operates within compliance boundaries while fostering trust and transparency with authorities and the community.`,
        team: {
          src: ea_govrel,
          description: "Government Relations Team (Left to Right): Azmil Muftakhor, Ahkamin.",
        },
        result: {
          src: ea_govrel_chart,
          description: `Skor kinerja Government Relations yang dihitung dengan rata-rata tertimbang dari lima indikator utama:
          1.) Stakeholder Engagement & Mapping
          2.) Permit & License Facilitation
          3.) Compliance & Certification Support
          4.) Regulatory Risk Mitigation
          5.) Interagency Communication & Visibility.`,
},
      },
    },
  },
  "Supply Chain Management": {
    sections: ["Logistic", "Warehouse & Inventory"],
    images: {
      Logistic: {
        overview:
          "Logistic team oversees transportation and distribution of goods.",
        team: {
          src: dep1_img,
          description: "Logistic team coordinating shipments",
        },
        result: {
          src: dep1_img,
          description: "Logistic delivery performance charts",
        },
      },
      "Warehouse & Inventory": {
        overview:
          "Warehouse and inventory roles encompass a wide range of responsibilities focused on managing the flow of goods in and out of a storage facility. These roles include receiving, storing, picking, packing, and shipping inventory, as well as maintaining accurate records and ensuring a safe and organized work environment. In essence, warehouse and inventory roles are vital for ensuring the smooth and efficient operation of a business's supply chain, requiring a combination of physical and technical skills, attention to detail, and a commitment to safety and accuracy.",
        team: {
          src: dep1_img,
          description: "Warehouse & Inventory team organizing stock",
        },
        result: {
          src: dep1_img,
          description: "Warehouse & Inventory throughput and error reports",
        },
      },
    },
  },
};

// Updated getOverviewForSection function (no change in signature)
export const getOverviewForSection = (
  department: string,
  section: string
): string => {
  return (
    departmentSections[department as keyof typeof departmentSections]?.images[section]
      ?.overview || ""
  );
};

export const getSectionsForDepartment = (department: string): string[] => {
  return departmentSections[department as keyof typeof departmentSections]?.sections || [];
};

export const getImageForSection = (
  department: string,
  section: string,
  imageType: "team" | "result"
): string => {
  return (
    departmentSections[department as keyof typeof departmentSections]?.images[section]?.[
      imageType
    ]?.src || ""
  );
};

export const getImageDescriptionForSection = (
  department: string,
  section: string,
  imageType: "team" | "result"
): string => {
  return (
    departmentSections[department as keyof typeof departmentSections]?.images[section]?.[
      imageType
    ]?.description || ""
  );
};

export const getDepartments = (): string[] => {
  return Object.keys(departmentSections);
};
