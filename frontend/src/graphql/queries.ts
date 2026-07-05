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
