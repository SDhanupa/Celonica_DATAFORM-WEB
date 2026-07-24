import { gql } from '@apollo/client';

export const GET_ME = gql`
  query GetMe {
    me {
      id
      keycloakSub
      email
      name
      nic
      mobileNumber
      address
      dob
      gender
      role
      isActive
      lastLoginAt
      createdAt
    }
    meUser {
      id
      keycloakSub
      email
      name
      firstName
      lastName
      nic
      mobileNumber
      address
      dob
      gender
      createdAt
    }
    needsOnboarding
  }
`;
export const GET_HOUSING_DATA = gql`
  query GetHousingData($district_id: ID, $city_code: String, $gn_id: ID) {
    housingData(district_id: $district_id, city_code: $city_code, gn_id: $gn_id) {
      location_name
      total_housing_units
      y_2011
      y_2010
      y_2009
      y_2008
      y_2007
      y_2006
      y_2005
      y_2000_2004
      y_1995_1999
      y_1990_1994
      y_1980_1989
      before_80
    }
  }
`;

export const GET_ADMINS = gql`
  query GetAdmins {
    admins {
      id
      keycloakSub
      email
      name
      role
      isActive
      lastLoginAt
      createdAt
    }
  }
`;

export const GET_ADMIN = gql`
  query GetAdmin($id: ID!) {
    admin(id: $id) {
      id
      keycloakSub
      email
      name
      role
      isActive
      lastLoginAt
      createdAt
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalAdmins
      activeAdmins
      totalUsers
      totalQuestions
      totalReports
      pendingReports
    }
  }
`;

export const GET_QUESTIONS = gql`
  query GetQuestions {
    questions {
      id
      section
      questionText
      inputType
      sortOrder
      isActive
      createdAt
    }
  }
`;

export const GET_MY_ANSWERS = gql`
  query GetMyAnswers {
    myAnswers {
      id
      question {
        id
      }
      answerValue
      isSkipped
      createdAt
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      slug
      nameEn
      nameSi
      descriptionEn
      descriptionSi
      imagePath
      sortOrder
      progress
      children {
        id
      }
    }
  }
`;

export const GET_CATEGORY_BY_SLUG = gql`
  query GetCategoryBySlug($slug: String!) {
    categoryBySlug(slug: $slug) {
      id
      slug
      nameEn
      nameSi
      imagePath
      sortOrder
      progress
      ancestors {
        id
        slug
        nameEn
        nameSi
      }
      questions {
        id
        questionTextEn
        questionTextSi
        inputType
        isRepeater
        sortOrder
        isActive
      }
      children {
        id
        slug
        nameEn
        nameSi
        descriptionEn
        descriptionSi
        imagePath
        sortOrder
        progress
        children {
          id
        }
      }
    }
  }
`;

export const GET_CATEGORY_ANSWERS = gql`
  query GetCategoryAnswers($categoryId: ID!) {
    categoryAnswers(categoryId: $categoryId) {
      id
      answerValue
      isSkipped
      user {
        id
        name
        email
      }
      question {
        id
      }
    }
  }
`;

export const GET_GRAMA_NILADHARIS = gql`
  query GetGramaNiladharis($first: Int!, $page: Int!, $search: String) {
    gramaNiladharis(first: $first, page: $page, search: $search) {
      data {
        id
        provinceCode
        PCCODE
        districtCode
        DCCODE
        divisionalSecretariatCode
        DSCCODE
        code
        CCODE
        nameSi
        nameEn
        nameTa
        disEn
        police {
          id
          name
          psName
          psNameSi
          psNameTa
        }
        postOffice {
          id
          placeNameEnglish
          postalCode
        }
      }
      paginatorInfo {
        count
        currentPage
        firstItem
        hasMorePages
        lastItem
        lastPage
        perPage
        total
      }
    }
  }
`;

export const GET_POLICES = gql`
  query GetPolices($first: Int!, $page: Int!, $search: String) {
    polices(first: $first, page: $page, search: $search) {
      data {
        id
        psName
        psNameSi
        psNameTa
        psId
      }
      paginatorInfo {
        total
        currentPage
        lastPage
      }
    }
  }
`;

export const GET_POST_OFFICES_BY_DISTRICT = gql`
  query GetPostOfficesByDistrict($district: String!) {
    postOfficesByDistrict(district: $district) {
      id
      placeNameEnglish
      district
      postalCode
    }
  }
`;

export const GET_DISTRICTS = gql`
  query GetDistricts($search: String, $first: Int, $page: Int) {
    districts(search: $search, first: $first, page: $page) {
      code
      nameEn
      nameSi
      nameTa
    }
  }
`;

export const GET_PHI_AREAS_BY_DISTRICT = gql`
  query GetPhiAreasByDistrict($district: String!) {
    phiAreasByDistrict(district: $district) {
      id
      fullLocationName
      nameEn
      nameSi
      nameTa
      district
      code
    }
  }
`;

export const GET_TRS_AREAS_BY_DISTRICT = gql`
  query GetTrsAreasByDistrict($district: String!) {
    trsAreasByDistrict(district: $district) {
      id
      fullLocationName
      nameEn
      nameSi
      nameTa
      district
      code
    }
  }
`;

export const GET_P_DISTRICTS = gql`
  query GetPDistricts {
    pDistricts {
      id
      admin2NameEn
      admin2NameSi
      admin2NameTa
      admin2Pcode
      admin1Pcode
      populationBoth
      populationMale
      populationFemale
      pProvince {
        id
        admin1NameEn
        admin1NameSi
        admin1NameTa
        admin1Pcode
      }
    }
  }
`;

export const GET_P_DISTRICT_WITH_GNS = gql`
  query GetPDistrictWithGns($id: ID!) {
    pDistrict(id: $id) {
      id
      admin2NameEn
      admin2NameSi
      admin2NameTa
      admin2Pcode
      gramaNiladharis {
        id
        code
        CCODE
        nameEn
        nameSi
        nameTa
        dsEn
        dsSi
        dsTa
        divisionalSecretariatCode
        pGn {
          id
          gnName
          populationBoth
          populationMale
          populationFemale
          age_0_14
          age_15_59
          age_60_64
          age_65_above
        }
        gnEconomy {
          id
          total
          employed
          unemployed
          economically_not_active
        }
        housingOwnershipStatus {
          id
          total_households
          owned_by_member
          rent_gov
          rent_private
          free_of_rent
          encroached
          other
        }
        housingWallType {
          id
          total_units
          brick
          cement_block_stone
          cabook
          soil_bricks
          mud
          cadjan_palmyrah
          plank_metal_sheet
          other
        }
        housingUnitType {
          id
          total_units
          permanent
          semi_permanent
          improvised
          unclassified
        }
        toiletFacility {
          id
          total_households
          water_seal_piped_sewer
          water_seal_septic_tank
          pour_flush
          direct_pit
          other
          not_using
        }
        drinkingWaterSource {
          id
          total_households
          protected_well_within
          protected_well_outside
          unprotected_well
          tap_within_unit
          tap_within_premises_outside
          tap_outside_premises
          rural_water_projects
          tube_well
          bowser
          river_tank_stream
          other
        }
        solidWasteDisposal {
          id
          total_households
          collected_by_local_authorities
          occupants_burn
          occupants_bury
          occupants_composting
          dispose_into_environment
          other
        }
        roomsInHousingUnit {
          id
          total_housing_units
          room_1
          rooms_2
          rooms_3
          rooms_4
          rooms_5
          rooms_6
          rooms_7
          rooms_8
          rooms_9
          rooms_10_and_above
        }
        housingRoofType {
          id
          total_housing_units
          tile
          asbestos
          concrete
          zink_aluminium_sheet
          metal_sheet
          cadjan_palmyrah_straw
          other
        }
        religiousAffiliation {
          id
          total_population
          buddhist
          hindu
          islam
          roman_catholic
          other_christian
          other
        }
        householdHeadRelationship {
          id
          total_population
          head
          wife_husband
          son_daughter
          son_daughter_in_law
          grandchild_great_grandchild
          parent_of_head_or_spouse
          other_relative
          domestic_employee
          boarder
          non_relative
          clergy
          not_stated
        }
      }
    }
  }
`;

export const GET_GN_BY_COORDINATES = gql`
  query GetGnByCoordinates($lat: Float!, $lng: Float!) {
    gnByCoordinates(lat: $lat, lng: $lng) {
      id
      code
      CCODE
      nameEn
      nameSi
      nameTa
      dsEn
      dsSi
      dsTa
      divisionalSecretariatCode
      pDistrict {
        id
        admin2NameEn
        admin2NameSi
        admin2NameTa
      }
      pGn {
        id
        gnName
        populationBoth
        populationMale
        populationFemale
        age_0_14
        age_15_59
        age_60_64
        age_65_above
      }
      gnEconomy {
        id
        total
        employed
        unemployed
        economically_not_active
      }
      housingOwnershipStatus {
        id
        total_households
        owned_by_member
        rent_gov
        rent_private
        free_of_rent
        encroached
        other
      }
      housingWallType {
        id
        total_units
        brick
        cement_block_stone
        cabook
        soil_bricks
        mud
        cadjan_palmyrah
        plank_metal_sheet
        other
      }
      housingUnitType {
        id
        total_units
        permanent
        semi_permanent
        improvised
        unclassified
      }
      toiletFacility {
        id
        total_households
        water_seal_piped_sewer
        water_seal_septic_tank
        pour_flush
        direct_pit
        other
        not_using
      }
      drinkingWaterSource {
        id
        total_households
        protected_well_within
        protected_well_outside
        unprotected_well
        tap_within_unit
        tap_within_premises_outside
        tap_outside_premises
        rural_water_projects
        tube_well
        bowser
        river_tank_stream
        other
      }
      solidWasteDisposal {
        id
        total_households
        collected_by_local_authorities
        occupants_burn
        occupants_bury
        occupants_composting
        dispose_into_environment
        other
      }
      roomsInHousingUnit {
        id
        total_housing_units
        room_1
        rooms_2
        rooms_3
        rooms_4
        rooms_5
        rooms_6
        rooms_7
        rooms_8
        rooms_9
        rooms_10_and_above
      }
      housingRoofType {
        id
        total_housing_units
        tile
        asbestos
        concrete
        zink_aluminium_sheet
        metal_sheet
        cadjan_palmyrah_straw
        other
      }
      religiousAffiliation {
        id
        total_population
        buddhist
        hindu
        islam
        roman_catholic
        other_christian
        other
      }
      householdHeadRelationship {
        id
        total_population
        head
        wife_husband
        son_daughter
        son_daughter_in_law
        grandchild_great_grandchild
        parent_of_head_or_spouse
        other_relative
        domestic_employee
        boarder
        non_relative
        clergy
        not_stated
      }
    }
  }
`;
