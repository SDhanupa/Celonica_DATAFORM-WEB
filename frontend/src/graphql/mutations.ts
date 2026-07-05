import { gql } from '@apollo/client';

export const REGISTER_USER = gql`
  mutation RegisterUser(
    $email: String!
    $firstName: String!
    $lastName: String!
    $nic: String
    $password: String!
    $mobileNumber: String
    $role: String!
  ) {
    registerUser(
      email: $email
      firstName: $firstName
      lastName: $lastName
      nic: $nic
      password: $password
      mobileNumber: $mobileNumber
      role: $role
    )
  }
`;

export const REGISTER_ADMIN = gql`
  mutation RegisterAdmin(
    $keycloakSub: String!
    $email: String!
    $name: String!
    $role: AdminRole!
  ) {
    registerAdmin(
      keycloakSub: $keycloakSub
      email: $email
      name: $name
      role: $role
    ) {
      id
      email
      name
      role
      isActive
      createdAt
    }
  }
`;

export const UPDATE_ADMIN_ROLE = gql`
  mutation UpdateAdminRole($id: ID!, $role: AdminRole!) {
    updateAdminRole(id: $id, role: $role) {
      id
      role
      email
      name
    }
  }
`;

export const DEACTIVATE_ADMIN = gql`
  mutation DeactivateAdmin($id: ID!) {
    deactivateAdmin(id: $id) {
      id
      isActive
      email
      name
    }
  }
`;

export const ACTIVATE_ADMIN = gql`
  mutation ActivateAdmin($id: ID!) {
    activateAdmin(id: $id) {
      id
      isActive
      email
      name
    }
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile(
    $nic: String
    $mobileNumber: String
    $address: String
    $dob: String
    $gender: String
  ) {
    updateUserProfile(
      nic: $nic
      mobileNumber: $mobileNumber
      address: $address
      dob: $dob
      gender: $gender
    ) {
      id
      nic
      mobileNumber
      address
      dob
      gender
    }
  }
`;

export const CREATE_QUESTION = gql`
  mutation CreateQuestion(
    $categoryId: ID!
    $section: String
    $questionTextEn: String!
    $questionTextSi: String
    $inputType: String!
    $isRepeater: Boolean
    $sortOrder: Int!
  ) {
    createQuestion(
      categoryId: $categoryId
      section: $section
      questionTextEn: $questionTextEn
      questionTextSi: $questionTextSi
      inputType: $inputType
      isRepeater: $isRepeater
      sortOrder: $sortOrder
    ) {
      id
      questionTextEn
      isRepeater
    }
  }
`;

export const UPDATE_QUESTION = gql`
  mutation UpdateQuestion(
    $id: ID!
    $categoryId: ID!
    $section: String
    $questionTextEn: String!
    $questionTextSi: String
    $inputType: String!
    $isRepeater: Boolean
    $sortOrder: Int!
    $isActive: Boolean
  ) {
    updateQuestion(
      id: $id
      categoryId: $categoryId
      section: $section
      questionTextEn: $questionTextEn
      questionTextSi: $questionTextSi
      inputType: $inputType
      isRepeater: $isRepeater
      sortOrder: $sortOrder
      isActive: $isActive
    ) {
      id
      questionTextEn
      isRepeater
    }
  }
`;

export const DELETE_QUESTION = gql`
  mutation DeleteQuestion($id: ID!) {
    deleteQuestion(id: $id)
  }
`;

export const ANSWER_QUESTION = gql`
  mutation AnswerQuestion(
    $questionId: ID!
    $iteration: Int
    $answerValue: String
    $isSkipped: Boolean!
  ) {
    answerQuestion(
      questionId: $questionId
      iteration: $iteration
      answerValue: $answerValue
      isSkipped: $isSkipped
    ) {
      id
      answerValue
      iteration
      isSkipped
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory(
    $parentId: ID
    $slug: String!
    $nameEn: String!
    $nameSi: String!
    $imagePath: String
    $sortOrder: Int
  ) {
    createCategory(
      parentId: $parentId
      slug: $slug
      nameEn: $nameEn
      nameSi: $nameSi
      imagePath: $imagePath
      sortOrder: $sortOrder
    ) {
      id
      slug
      nameEn
      nameSi
      imagePath
      sortOrder
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory(
    $id: ID!
    $slug: String
    $nameEn: String
    $nameSi: String
    $imagePath: String
    $sortOrder: Int
  ) {
    updateCategory(
      id: $id
      slug: $slug
      nameEn: $nameEn
      nameSi: $nameSi
      imagePath: $imagePath
      sortOrder: $sortOrder
    ) {
      id
      slug
      nameEn
      nameSi
      imagePath
      sortOrder
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;
