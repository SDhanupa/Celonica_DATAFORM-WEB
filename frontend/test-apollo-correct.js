import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client/core/index.js';

const httpLink = createHttpLink({
  uri: 'http://127.0.0.1:8000/graphql'
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});

const GET_GN_BY_CCODE = gql`
    query GetGnByCcode($CCODE: String!) {
      gnByCcode(CCODE: $CCODE) {
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
        boundary {
          minLat
          maxLat
          minLng
          maxLng
          polygons
        }
        pDistrict {
          id
          admin2NameEn
          admin2NameSi
          admin2NameTa
        }
        police {
          id
          psName
          psNameSi
          psNameTa
          psId
          distanceToThePoliceStation
          lat
          lng
        }
        postOffice {
          id
          placeNameEnglish
          sinhala
          tamil
          postalCode
          district
          dsAga
          latitude
          longitude
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

async function test() {
  const res = await fetch('http://127.0.0.1:8000/api/guest-token');
  const data = await res.json();
  const token = data.token;
  
  try {
    const result = await client.query({
      query: GET_GN_BY_CCODE,
      variables: { CCODE: 'WCCSA' },
      context: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
    console.log("Success:", JSON.stringify(result.data, null, 2));
  } catch (err) {
    console.error("Error:", JSON.stringify(err, null, 2));
  }
}

test();



