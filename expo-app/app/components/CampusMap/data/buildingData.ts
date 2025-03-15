import { Building } from '../../../utils/types';

const SGW_FILL_COLOR = "rgba(0, 0, 255, 1)";
const SGW_STROKE_COLOR = "rgba(0, 0, 255, 1)";
const LOY_FILL_COLOR = "rgba(255, 165, 0, 1)";
const LOY_STROKE_COLOR = "rgba(255, 140, 0, 1)";

/**
 * SGW Campus Buildings
 */
export const SGWBuildings: Building[] = [
  {
    id: 'FB',
    name: 'Faubourg Building',
    coordinates: [
      { latitude: 45.49496, longitude: -73.57784 },
      { latitude: 45.49468, longitude: -73.5772 },
      { latitude: 45.49441, longitude: -73.57754 },
      { latitude: 45.49469, longitude: -73.57806 },
    ],
    fillColor: SGW_FILL_COLOR,
    strokeColor: SGW_STROKE_COLOR,
    description:
      'The Faubourg Building is a historical structure located at the heart of SGW campus, offering a mix of classrooms, lecture halls, and office spaces.',
    campus: 'SGW',
  },
  {
    id: 'FG',
    name: 'Faubourg Ste-Catherine Building',
    coordinates: [
      { latitude: 45.49471, longitude: -73.57806 },
      { latitude: 45.49441, longitude: -73.57754 },
      { latitude: 45.4936, longitude: -73.57871 },
      { latitude: 45.49383, longitude: -73.57911 },
    ],
    fillColor: SGW_FILL_COLOR,
    strokeColor: SGW_STROKE_COLOR,
    description:
      'This building provides additional space for academic programs and student services, enhancing the overall student experience at SGW.',
    campus: 'SGW',
  },
  {
    id: 'MB',
    name: 'John Molson Building',
    coordinates: [
      { latitude: 45.49559, longitude: -73.57921 },
      { latitude: 45.49523, longitude: -73.5785 },
      { latitude: 45.49496, longitude: -73.57878 },
      { latitude: 45.49535, longitude: -73.57941 },
    ],
    fillColor: SGW_FILL_COLOR,
    strokeColor: SGW_STROKE_COLOR,
    description:
      'Home to the John Molson School of Business, this building is a hub for students pursuing business degrees with modern classrooms, computer labs, and meeting spaces.',
    campus: 'SGW',
  },
  {
    id: 'GM',
    name: 'Guy-De Maisonneuve Building',
    coordinates: [
      { latitude: 45.49616, longitude: -73.57888 },
      { latitude: 45.49597, longitude: -73.57842 },
      { latitude: 45.49559, longitude: -73.57888 },
      { latitude: 45.49577, longitude: -73.57914 },
    ],
    fillColor: SGW_FILL_COLOR,
    strokeColor: SGW_STROKE_COLOR,
    description:
      'The Guy-De Maisonneuve Building houses several academic departments and offers numerous student services, including study rooms and recreational spaces.',
    campus: 'SGW',
  },
  {
    id: 'EV',
    name: 'Engineering, Computer Science and Visual Arts Integrated Complex',
    coordinates: [
      { latitude: 45.49597, longitude: -73.57842 },
      { latitude: 45.49577, longitude: -73.57801 },
      { latitude: 45.49607, longitude: -73.57767 },
      { latitude: 45.49586, longitude: -73.57722 },
      { latitude: 45.49518, longitude: -73.57788 },
      { latitude: 45.49559, longitude: -73.57880 },
    ],
    fillColor: SGW_FILL_COLOR,
    strokeColor: SGW_STROKE_COLOR,
    description:
      'A state-of-the-art facility for the university’s engineering, computer science, and visual arts programs, featuring high-tech classrooms, labs, and collaborative spaces.',
    campus: 'SGW',
  },
  {
    id: 'LS',
    name: 'Learning Square Building',
    coordinates: [
      { latitude: 45.49632, longitude: -73.57978 },
      { latitude: 45.49615, longitude: -73.57941 },
      { latitude: 45.49639, longitude: -73.57922 },
      { latitude: 45.49656, longitude: -73.57959 },
    ],
    fillColor: SGW_FILL_COLOR,
    strokeColor: SGW_STROKE_COLOR,
    description:
      'A modern building that provides innovative learning spaces and hosts various university events and workshops, ideal for interactive educational experiences.',
    campus: 'SGW',
  },
  {
    id: 'ER',
    name: 'ER Building',
    coordinates: [
      { latitude: 45.49656, longitude: -73.57964 },
      { latitude: 45.49611, longitude: -73.57997 },
      { latitude: 45.49626, longitude: -73.58047 },
      { latitude: 45.4967, longitude: -73.58012 },
    ],
    fillColor: SGW_FILL_COLOR,
    strokeColor: SGW_STROKE_COLOR,
    description:
      'The ER Building serves as a space for academic programs, student activities, and a variety of administrative services.',
    campus: 'SGW',
  },
  {
    id: 'H',
    name: 'Hall Building',
    coordinates: [
      { latitude: 45.49777, longitude: -73.57901 },
      { latitude: 45.49741, longitude: -73.57830 },
      { latitude: 45.49682, longitude: -73.57886 },
      { latitude: 45.49720, longitude: -73.57959 },
    ],
    fillColor: SGW_FILL_COLOR,
    strokeColor: SGW_STROKE_COLOR,
    description:
      'One of the primary buildings on the SGW campus, the Hall Building offers classrooms, offices, and large lecture halls for various programs.',
    campus: 'SGW',
  },
  {
    id: 'LB',
    name: 'J.W. McConnell Building',
    coordinates: [
      { latitude: 45.49730, longitude: -73.57806 },
      { latitude: 45.49695, longitude: -73.57723 },
      { latitude: 45.49659, longitude: -73.57755 },
      { latitude: 45.49651, longitude: -73.57743 },
      { latitude: 45.49624, longitude: -73.57770 },
      { latitude: 45.49669, longitude: -73.57863 },
    ],
    fillColor: SGW_FILL_COLOR,
    strokeColor: SGW_STROKE_COLOR,
    description:
      'This building features a mix of research labs, classrooms, and faculty offices, offering a variety of spaces for student learning and innovation.',
    campus: 'SGW',
  },
  {
    id: 'VA',
    name: 'Visual Arts Building',
    coordinates: [
      { latitude: 45.49564, longitude: -73.57438 },
      { latitude: 45.49622, longitude: -73.57377 },
      { latitude: 45.49594, longitude: -73.57317 },
      { latitude: 45.49532, longitude: -73.57371 },
    ],
    fillColor: SGW_FILL_COLOR,
    strokeColor: SGW_STROKE_COLOR,
    description:
      'The Visual Arts Building is home to the university’s arts programs, featuring art galleries, studios, and classrooms dedicated to visual and performing arts.',
    campus: 'SGW',
  },
  {
    id: 'GN',
    name: 'Grey Nuns Building',
    coordinates: [
      { latitude: 45.4945, longitude: -73.57695 },
      { latitude: 45.49387, longitude: -73.57527 },
      { latitude: 45.49243, longitude: -73.57664 },
      { latitude: 45.49333, longitude: -73.57835 },
    ],
    fillColor: SGW_FILL_COLOR,
    strokeColor: SGW_STROKE_COLOR,
    description:
      'A key building for student residence, this building also offers a variety of social spaces and is home to several services supporting students at SGW.',
    campus: 'SGW',
  },
];

/**
 * Loyola Campus Buildings
 */
export const LoyolaBuildings: Building[] = [
  {
    id: 'CW',
    name: 'Central Wing',
    coordinates: [
      { latitude: 45.45843, longitude: -73.64142 },
      { latitude: 45.45934, longitude: -73.64074 },
      { latitude: 45.45838, longitude: -73.6383 },
      { latitude: 45.45755, longitude: -73.63923 },
    ],
    fillColor: LOY_FILL_COLOR,
    strokeColor: LOY_STROKE_COLOR,
    description:
      'The Central Wing is the main academic building at Loyola campus, offering classrooms and faculty offices for a wide range of programs.',
    campus: 'LOY',
  },
  {
    id: 'LW',
    name: 'Left Wing',
    coordinates: [
      { latitude: 45.45843, longitude: -73.64142 },
      { latitude: 45.45755, longitude: -73.63923 },
      { latitude: 45.45661, longitude: -73.64028 },
      { latitude: 45.45735, longitude: -73.64224 },
    ],
    fillColor: LOY_FILL_COLOR,
    strokeColor: LOY_STROKE_COLOR,
    description:
      'The Left Wing is dedicated to student services and administrative offices, providing essential support for students and staff at Loyola.',
    campus: 'LOY',
  },
  {
    id: 'RW',
    name: 'Right Wing',
    coordinates: [
      { latitude: 45.45934, longitude: -73.64074 },
      { latitude: 45.45838, longitude: -73.6383 },
      { latitude: 45.45922, longitude: -73.63732 },
      { latitude: 45.46035, longitude: -73.64026 },
    ],
    fillColor: LOY_FILL_COLOR,
    strokeColor: LOY_STROKE_COLOR,
    description:
      'The Right Wing houses additional classrooms and study areas for various academic programs at Loyola.',
    campus: 'LOY',
  },
  {
    id: 'NW',
    name: 'North Wing',
    coordinates: [
      { latitude: 45.45959, longitude: -73.64064 },
      { latitude: 45.45799, longitude: -73.64187 },
      { latitude: 45.45823, longitude: -73.64253 },
      { latitude: 45.45799, longitude: -73.64271 },
      { latitude: 45.45828, longitude: -73.6436 },
      { latitude: 45.46006, longitude: -73.64207 },
    ],
    fillColor: LOY_FILL_COLOR,
    strokeColor: LOY_STROKE_COLOR,
    description:
      'The North Wing offers additional student and faculty spaces, with specialized facilities for various departments.',
    campus: 'LOY',
  },
  {
    id: 'SW',
    name: 'South Wing',
    coordinates: [
      { latitude: 45.45718, longitude: -73.63945 },
      { latitude: 45.45668, longitude: -73.63819 },
      { latitude: 45.45602, longitude: -73.63872 },
      { latitude: 45.45582, longitude: -73.63807 },
      { latitude: 45.45777, longitude: -73.63431 },
      { latitude: 45.45912, longitude: -73.63723 },
    ],
    fillColor: LOY_FILL_COLOR,
    strokeColor: LOY_STROKE_COLOR,
    description:
      'The South Wing offers academic spaces, study areas, and provides access to outdoor spaces, ideal for relaxing and gathering.',
    campus: 'LOY',
  },
];