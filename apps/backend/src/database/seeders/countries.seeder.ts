import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../../modules/products/entities/country.entity';

@Injectable()
export class CountriesSeeder {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  private readonly countriesData = [
    { id: '1', name: 'Afghanistan', code: 'AF', iso2: 'AF', iso3: 'AFG', phoneCode: '93', latitude: 33.0, longitude: 65.0 },
    { id: '2', name: 'Albania', code: 'AL', iso2: 'AL', iso3: 'ALB', phoneCode: '355', latitude: 41.0, longitude: 20.0 },
    { id: '3', name: 'Algeria', code: 'DZ', iso2: 'DZ', iso3: 'DZA', phoneCode: '213', latitude: 28.0, longitude: 3.0 },
    { id: '4', name: 'American Samoa', code: 'AS', iso2: 'AS', iso3: 'ASM', phoneCode: '1-684', latitude: -14.33, longitude: -170.13 },
    { id: '5', name: 'Andorra', code: 'AD', iso2: 'AD', iso3: 'AND', phoneCode: '376', latitude: 42.5, longitude: 1.5 },
    { id: '6', name: 'Angola', code: 'AO', iso2: 'AO', iso3: 'AGO', phoneCode: '244', latitude: -12.5, longitude: 18.5 },
    { id: '7', name: 'Anguilla', code: 'AI', iso2: 'AI', iso3: 'AIA', phoneCode: '1-264', latitude: 18.25, longitude: -63.17 },
    { id: '8', name: 'Antarctica', code: 'AQ', iso2: 'AQ', iso3: 'ATA', phoneCode: '672', latitude: -90.0, longitude: 0.0 },
    { id: '9', name: 'Antigua and Barbuda', code: 'AG', iso2: 'AG', iso3: 'ATG', phoneCode: '1-268', latitude: 17.05, longitude: -61.8 },
    { id: '10', name: 'Argentina', code: 'AR', iso2: 'AR', iso3: 'ARG', phoneCode: '54', latitude: -34.0, longitude: -64.0 },
    { id: '11', name: 'Armenia', code: 'AM', iso2: 'AM', iso3: 'ARM', phoneCode: '374', latitude: 40.0, longitude: 45.0 },
    { id: '12', name: 'Aruba', code: 'AW', iso2: 'AW', iso3: 'ABW', phoneCode: '297', latitude: 12.5, longitude: -69.97 },
    { id: '13', name: 'Australia', code: 'AU', iso2: 'AU', iso3: 'AUS', phoneCode: '61', latitude: -27.0, longitude: 133.0 },
    { id: '14', name: 'Austria', code: 'AT', iso2: 'AT', iso3: 'AUT', phoneCode: '43', latitude: 47.33, longitude: 13.33 },
    { id: '15', name: 'Azerbaijan', code: 'AZ', iso2: 'AZ', iso3: 'AZE', phoneCode: '994', latitude: 40.5, longitude: 47.5 },
    { id: '16', name: 'Bahamas', code: 'BS', iso2: 'BS', iso3: 'BHS', phoneCode: '1-242', latitude: 24.25, longitude: -76.0 },
    { id: '17', name: 'Bahrain', code: 'BH', iso2: 'BH', iso3: 'BHR', phoneCode: '973', latitude: 26.0, longitude: 50.55 },
    { id: '18', name: 'Bangladesh', code: 'BD', iso2: 'BD', iso3: 'BGD', phoneCode: '880', latitude: 24.0, longitude: 90.0 },
    { id: '19', name: 'Barbados', code: 'BB', iso2: 'BB', iso3: 'BRB', phoneCode: '1-246', latitude: 13.17, longitude: -59.53 },
    { id: '20', name: 'Belarus', code: 'BY', iso2: 'BY', iso3: 'BLR', phoneCode: '375', latitude: 53.0, longitude: 28.0 },
    { id: '21', name: 'Belgium', code: 'BE', iso2: 'BE', iso3: 'BEL', phoneCode: '32', latitude: 50.83, longitude: 4.0 },
    { id: '22', name: 'Belize', code: 'BZ', iso2: 'BZ', iso3: 'BLZ', phoneCode: '501', latitude: 17.25, longitude: -88.75 },
    { id: '23', name: 'Benin', code: 'BJ', iso2: 'BJ', iso3: 'BEN', phoneCode: '229', latitude: 9.5, longitude: 2.25 },
    { id: '24', name: 'Bermuda', code: 'BM', iso2: 'BM', iso3: 'BMU', phoneCode: '1-441', latitude: 32.33, longitude: -64.75 },
    { id: '25', name: 'Bhutan', code: 'BT', iso2: 'BT', iso3: 'BTN', phoneCode: '975', latitude: 27.5, longitude: 90.5 },
    { id: '26', name: 'Bolivia', code: 'BO', iso2: 'BO', iso3: 'BOL', phoneCode: '591', latitude: -17.0, longitude: -65.0 },
    { id: '27', name: 'Bosnia and Herzegovina', code: 'BA', iso2: 'BA', iso3: 'BIH', phoneCode: '387', latitude: 44.0, longitude: 18.0 },
    { id: '28', name: 'Botswana', code: 'BW', iso2: 'BW', iso3: 'BWA', phoneCode: '267', latitude: -22.0, longitude: 24.0 },
    { id: '29', name: 'Bouvet Island', code: 'BV', iso2: 'BV', iso3: 'BVT', phoneCode: '47', latitude: -54.43, longitude: 3.4 },
    { id: '30', name: 'Brazil', code: 'BR', iso2: 'BR', iso3: 'BRA', phoneCode: '55', latitude: -10.0, longitude: -55.0 },
    { id: '31', name: 'British Indian Ocean Territory', code: 'IO', iso2: 'IO', iso3: 'IOT', phoneCode: '246', latitude: -6.0, longitude: 71.5 },
    { id: '32', name: 'Brunei Darussalam', code: 'BN', iso2: 'BN', iso3: 'BRN', phoneCode: '673', latitude: 4.5, longitude: 114.67 },
    { id: '33', name: 'Bulgaria', code: 'BG', iso2: 'BG', iso3: 'BGR', phoneCode: '359', latitude: 43.0, longitude: 25.0 },
    { id: '34', name: 'Burkina Faso', code: 'BF', iso2: 'BF', iso3: 'BFA', phoneCode: '226', latitude: 13.0, longitude: -2.0 },
    { id: '35', name: 'Burundi', code: 'BI', iso2: 'BI', iso3: 'BDI', phoneCode: '257', latitude: -3.5, longitude: 30.0 },
    { id: '36', name: 'Cambodia', code: 'KH', iso2: 'KH', iso3: 'KHM', phoneCode: '855', latitude: 13.0, longitude: 105.0 },
    { id: '37', name: 'Cameroon', code: 'CM', iso2: 'CM', iso3: 'CMR', phoneCode: '237', latitude: 6.0, longitude: 12.0 },
    { id: '38', name: 'Canada', code: 'CA', iso2: 'CA', iso3: 'CAN', phoneCode: '1', latitude: 60.0, longitude: -95.0 },
    { id: '39', name: 'Cape Verde', code: 'CV', iso2: 'CV', iso3: 'CPV', phoneCode: '238', latitude: 16.0, longitude: -24.0 },
    { id: '40', name: 'Cayman Islands', code: 'KY', iso2: 'KY', iso3: 'CYM', phoneCode: '1-345', latitude: 19.5, longitude: -80.5 },
    { id: '41', name: 'Central African Republic', code: 'CF', iso2: 'CF', iso3: 'CAF', phoneCode: '236', latitude: 7.0, longitude: 21.0 },
    { id: '42', name: 'Chad', code: 'TD', iso2: 'TD', iso3: 'TCD', phoneCode: '235', latitude: 15.0, longitude: 19.0 },
    { id: '43', name: 'Chile', code: 'CL', iso2: 'CL', iso3: 'CHL', phoneCode: '56', latitude: -30.0, longitude: -71.0 },
    { id: '44', name: 'China', code: 'CN', iso2: 'CN', iso3: 'CHN', phoneCode: '86', latitude: 35.0, longitude: 105.0 },
    { id: '45', name: 'Christmas Island', code: 'CX', iso2: 'CX', iso3: 'CXR', phoneCode: '61', latitude: -10.5, longitude: 105.67 },
    { id: '46', name: 'Cocos (Keeling) Islands', code: 'CC', iso2: 'CC', iso3: 'CCK', phoneCode: '61', latitude: -12.5, longitude: 96.83 },
    { id: '47', name: 'Colombia', code: 'CO', iso2: 'CO', iso3: 'COL', phoneCode: '57', latitude: 4.0, longitude: -72.0 },
    { id: '48', name: 'Comoros', code: 'KM', iso2: 'KM', iso3: 'COM', phoneCode: '269', latitude: -12.17, longitude: 44.25 },
    { id: '49', name: 'Congo', code: 'CG', iso2: 'CG', iso3: 'COG', phoneCode: '242', latitude: -1.0, longitude: 15.0 },
    { id: '50', name: 'Congo, Democratic Republic', code: 'CD', iso2: 'CD', iso3: 'COD', phoneCode: '243', latitude: 0.0, longitude: 25.0 },
    { id: '51', name: 'Cook Islands', code: 'CK', iso2: 'CK', iso3: 'COK', phoneCode: '682', latitude: -21.23, longitude: -159.77 },
    { id: '52', name: 'Costa Rica', code: 'CR', iso2: 'CR', iso3: 'CRI', phoneCode: '506', latitude: 10.0, longitude: -84.0 },
    { id: '53', name: 'Croatia', code: 'HR', iso2: 'HR', iso3: 'HRV', phoneCode: '385', latitude: 45.17, longitude: 15.5 },
    { id: '54', name: 'Cuba', code: 'CU', iso2: 'CU', iso3: 'CUB', phoneCode: '53', latitude: 21.5, longitude: -80.0 },
    { id: '55', name: 'Cyprus', code: 'CY', iso2: 'CY', iso3: 'CYP', phoneCode: '357', latitude: 35.0, longitude: 33.0 },
    { id: '56', name: 'Czech Republic', code: 'CZ', iso2: 'CZ', iso3: 'CZE', phoneCode: '420', latitude: 49.75, longitude: 15.5 },
    { id: '57', name: 'Côte d\'Ivoire', code: 'CI', iso2: 'CI', iso3: 'CIV', phoneCode: '225', latitude: 8.0, longitude: -5.0 },
    { id: '58', name: 'Denmark', code: 'DK', iso2: 'DK', iso3: 'DNK', phoneCode: '45', latitude: 56.0, longitude: 10.0 },
    { id: '59', name: 'Djibouti', code: 'DJ', iso2: 'DJ', iso3: 'DJI', phoneCode: '253', latitude: 11.5, longitude: 43.0 },
    { id: '60', name: 'Dominica', code: 'DM', iso2: 'DM', iso3: 'DMA', phoneCode: '1-767', latitude: 15.42, longitude: -61.33 },
    { id: '61', name: 'Dominican Republic', code: 'DO', iso2: 'DO', iso3: 'DOM', phoneCode: '1-809', latitude: 19.0, longitude: -70.67 },
    { id: '62', name: 'Ecuador', code: 'EC', iso2: 'EC', iso3: 'ECU', phoneCode: '593', latitude: -2.0, longitude: -77.5 },
    { id: '63', name: 'Egypt', code: 'EG', iso2: 'EG', iso3: 'EGY', phoneCode: '20', latitude: 27.0, longitude: 30.0 },
    { id: '64', name: 'El Salvador', code: 'SV', iso2: 'SV', iso3: 'SLV', phoneCode: '503', latitude: 13.83, longitude: -88.92 },
    { id: '65', name: 'Equatorial Guinea', code: 'GQ', iso2: 'GQ', iso3: 'GNQ', phoneCode: '240', latitude: 2.0, longitude: 10.0 },
    { id: '66', name: 'Eritrea', code: 'ER', iso2: 'ER', iso3: 'ERI', phoneCode: '291', latitude: 15.0, longitude: 39.0 },
    { id: '67', name: 'Estonia', code: 'EE', iso2: 'EE', iso3: 'EST', phoneCode: '372', latitude: 59.0, longitude: 26.0 },
    { id: '68', name: 'Eswatini', code: 'SZ', iso2: 'SZ', iso3: 'SWZ', phoneCode: '268', latitude: -26.5, longitude: 31.5 },
    { id: '69', name: 'Ethiopia', code: 'ET', iso2: 'ET', iso3: 'ETH', phoneCode: '251', latitude: 8.0, longitude: 38.0 },
    { id: '70', name: 'Falkland Islands', code: 'FK', iso2: 'FK', iso3: 'FLK', phoneCode: '500', latitude: -51.75, longitude: -59.0 },
    { id: '71', name: 'Faroe Islands', code: 'FO', iso2: 'FO', iso3: 'FRO', phoneCode: '298', latitude: 62.0, longitude: -7.0 },
    { id: '72', name: 'Fiji', code: 'FJ', iso2: 'FJ', iso3: 'FJI', phoneCode: '679', latitude: -18.0, longitude: 175.0 },
    { id: '73', name: 'Finland', code: 'FI', iso2: 'FI', iso3: 'FIN', phoneCode: '358', latitude: 64.0, longitude: 26.0 },
    { id: '74', name: 'France', code: 'FR', iso2: 'FR', iso3: 'FRA', phoneCode: '33', latitude: 46.0, longitude: 2.0 },
    { id: '75', name: 'French Guiana', code: 'GF', iso2: 'GF', iso3: 'GUF', phoneCode: '594', latitude: 4.0, longitude: -53.0 },
    { id: '76', name: 'French Polynesia', code: 'PF', iso2: 'PF', iso3: 'PYF', phoneCode: '689', latitude: -15.0, longitude: -140.0 },
    { id: '77', name: 'French Southern Territories', code: 'TF', iso2: 'TF', iso3: 'ATF', phoneCode: '262', latitude: -43.0, longitude: 67.0 },
    { id: '78', name: 'Gabon', code: 'GA', iso2: 'GA', iso3: 'GAB', phoneCode: '241', latitude: -1.0, longitude: 11.75 },
    { id: '79', name: 'Gambia', code: 'GM', iso2: 'GM', iso3: 'GMB', phoneCode: '220', latitude: 13.47, longitude: -16.57 },
    { id: '80', name: 'Georgia', code: 'GE', iso2: 'GE', iso3: 'GEO', phoneCode: '995', latitude: 42.0, longitude: 43.5 },
    { id: '81', name: 'Germany', code: 'DE', iso2: 'DE', iso3: 'DEU', phoneCode: '49', latitude: 51.0, longitude: 9.0 },
    { id: '82', name: 'Ghana', code: 'GH', iso2: 'GH', iso3: 'GHA', phoneCode: '233', latitude: 8.0, longitude: -2.0 },
    { id: '83', name: 'Gibraltar', code: 'GI', iso2: 'GI', iso3: 'GIB', phoneCode: '350', latitude: 36.18, longitude: -5.37 },
    { id: '84', name: 'Greece', code: 'GR', iso2: 'GR', iso3: 'GRC', phoneCode: '30', latitude: 39.0, longitude: 22.0 },
    { id: '85', name: 'Greenland', code: 'GL', iso2: 'GL', iso3: 'GRL', phoneCode: '299', latitude: 72.0, longitude: -40.0 },
    { id: '86', name: 'Grenada', code: 'GD', iso2: 'GD', iso3: 'GRD', phoneCode: '1-473', latitude: 12.12, longitude: -61.67 },
    { id: '87', name: 'Guadeloupe', code: 'GP', iso2: 'GP', iso3: 'GLP', phoneCode: '590', latitude: 16.25, longitude: -61.58 },
    { id: '88', name: 'Guam', code: 'GU', iso2: 'GU', iso3: 'GUM', phoneCode: '1-671', latitude: 13.47, longitude: 144.78 },
    { id: '89', name: 'Guatemala', code: 'GT', iso2: 'GT', iso3: 'GTM', phoneCode: '502', latitude: 15.5, longitude: -90.25 },
    { id: '90', name: 'Guernsey', code: 'GG', iso2: 'GG', iso3: 'GGY', phoneCode: '44-1481', latitude: 49.5, longitude: -2.56 },
    { id: '91', name: 'Guinea', code: 'GN', iso2: 'GN', iso3: 'GIN', phoneCode: '224', latitude: 11.0, longitude: -10.0 },
    { id: '92', name: 'Guinea-Bissau', code: 'GW', iso2: 'GW', iso3: 'GNB', phoneCode: '245', latitude: 12.0, longitude: -15.0 },
    { id: '93', name: 'Guyana', code: 'GY', iso2: 'GY', iso3: 'GUY', phoneCode: '592', latitude: 5.0, longitude: -59.0 },
    { id: '94', name: 'Haiti', code: 'HT', iso2: 'HT', iso3: 'HTI', phoneCode: '509', latitude: 19.0, longitude: -72.42 },
    { id: '95', name: 'Heard Island and McDonald Islands', code: 'HM', iso2: 'HM', iso3: 'HMD', phoneCode: '672', latitude: -53.1, longitude: 72.52 },
    { id: '96', name: 'Holy See', code: 'VA', iso2: 'VA', iso3: 'VAT', phoneCode: '379', latitude: 41.9, longitude: 12.45 },
    { id: '97', name: 'Honduras', code: 'HN', iso2: 'HN', iso3: 'HND', phoneCode: '504', latitude: 15.0, longitude: -86.5 },
    { id: '98', name: 'Hong Kong', code: 'HK', iso2: 'HK', iso3: 'HKG', phoneCode: '852', latitude: 22.25, longitude: 114.17 },
    { id: '99', name: 'Hungary', code: 'HU', iso2: 'HU', iso3: 'HUN', phoneCode: '36', latitude: 47.0, longitude: 20.0 },
    { id: '100', name: 'Iceland', code: 'IS', iso2: 'IS', iso3: 'ISL', phoneCode: '354', latitude: 65.0, longitude: -18.0 },
    { id: '101', name: 'India', code: 'IN', iso2: 'IN', iso3: 'IND', phoneCode: '91', latitude: 20.0, longitude: 77.0 },
    { id: '102', name: 'Indonesia', code: 'ID', iso2: 'ID', iso3: 'IDN', phoneCode: '62', latitude: -5.0, longitude: 120.0 },
    { id: '103', name: 'Iran', code: 'IR', iso2: 'IR', iso3: 'IRN', phoneCode: '98', latitude: 32.0, longitude: 53.0 },
    { id: '104', name: 'Iraq', code: 'IQ', iso2: 'IQ', iso3: 'IRQ', phoneCode: '964', latitude: 33.0, longitude: 44.0 },
    { id: '105', name: 'Ireland', code: 'IE', iso2: 'IE', iso3: 'IRL', phoneCode: '353', latitude: 53.0, longitude: -8.0 },
    { id: '106', name: 'Isle of Man', code: 'IM', iso2: 'IM', iso3: 'IMN', phoneCode: '44-1624', latitude: 54.23, longitude: -4.55 },
    { id: '107', name: 'Israel', code: 'IL', iso2: 'IL', iso3: 'ISR', phoneCode: '972', latitude: 31.5, longitude: 34.75 },
    { id: '108', name: 'Italy', code: 'IT', iso2: 'IT', iso3: 'ITA', phoneCode: '39', latitude: 42.83, longitude: 12.83 },
    { id: '109', name: 'Jamaica', code: 'JM', iso2: 'JM', iso3: 'JAM', phoneCode: '1-876', latitude: 18.25, longitude: -77.5 },
    { id: '110', name: 'Japan', code: 'JP', iso2: 'JP', iso3: 'JPN', phoneCode: '81', latitude: 36.0, longitude: 138.0 },
    { id: '111', name: 'Jersey', code: 'JE', iso2: 'JE', iso3: 'JEY', phoneCode: '44-1534', latitude: 49.21, longitude: -2.13 },
    { id: '112', name: 'Jordan', code: 'JO', iso2: 'JO', iso3: 'JOR', phoneCode: '962', latitude: 31.0, longitude: 36.0 },
    { id: '113', name: 'Kazakhstan', code: 'KZ', iso2: 'KZ', iso3: 'KAZ', phoneCode: '7', latitude: 48.0, longitude: 68.0 },
    { id: '114', name: 'Kenya', code: 'KE', iso2: 'KE', iso3: 'KEN', phoneCode: '254', latitude: 1.0, longitude: 38.0 },
    { id: '115', name: 'Kiribati', code: 'KI', iso2: 'KI', iso3: 'KIR', phoneCode: '686', latitude: 1.42, longitude: 173.0 },
    { id: '116', name: 'Korea, Democratic People\'s Republic of', code: 'KP', iso2: 'KP', iso3: 'PRK', phoneCode: '850', latitude: 40.0, longitude: 127.0 },
    { id: '117', name: 'Korea, Republic of', code: 'KR', iso2: 'KR', iso3: 'KOR', phoneCode: '82', latitude: 37.0, longitude: 127.5 },
    { id: '118', name: 'Kuwait', code: 'KW', iso2: 'KW', iso3: 'KWT', phoneCode: '965', latitude: 29.34, longitude: 47.66 },
    { id: '119', name: 'Kyrgyzstan', code: 'KG', iso2: 'KG', iso3: 'KGZ', phoneCode: '996', latitude: 41.0, longitude: 75.0 },
    { id: '120', name: 'Lao People\'s Democratic Republic', code: 'LA', iso2: 'LA', iso3: 'LAO', phoneCode: '856', latitude: 18.0, longitude: 105.0 },
    { id: '121', name: 'Latvia', code: 'LV', iso2: 'LV', iso3: 'LVA', phoneCode: '371', latitude: 57.0, longitude: 25.0 },
    { id: '122', name: 'Lebanon', code: 'LB', iso2: 'LB', iso3: 'LBN', phoneCode: '961', latitude: 33.83, longitude: 35.83 },
    { id: '123', name: 'Lesotho', code: 'LS', iso2: 'LS', iso3: 'LSO', phoneCode: '266', latitude: -29.5, longitude: 28.5 },
    { id: '124', name: 'Liberia', code: 'LR', iso2: 'LR', iso3: 'LBR', phoneCode: '231', latitude: 6.5, longitude: -9.5 },
    { id: '125', name: 'Libya', code: 'LY', iso2: 'LY', iso3: 'LBY', phoneCode: '218', latitude: 25.0, longitude: 17.0 },
    { id: '126', name: 'Liechtenstein', code: 'LI', iso2: 'LI', iso3: 'LIE', phoneCode: '423', latitude: 47.17, longitude: 9.53 },
    { id: '127', name: 'Lithuania', code: 'LT', iso2: 'LT', iso3: 'LTU', phoneCode: '370', latitude: 56.0, longitude: 24.0 },
    { id: '128', name: 'Luxembourg', code: 'LU', iso2: 'LU', iso3: 'LUX', phoneCode: '352', latitude: 49.75, longitude: 6.17 },
    { id: '129', name: 'Macao', code: 'MO', iso2: 'MO', iso3: 'MAC', phoneCode: '853', latitude: 22.17, longitude: 113.55 },
    { id: '130', name: 'Madagascar', code: 'MG', iso2: 'MG', iso3: 'MDG', phoneCode: '261', latitude: -20.0, longitude: 47.0 },
    { id: '131', name: 'Malawi', code: 'MW', iso2: 'MW', iso3: 'MWI', phoneCode: '265', latitude: -13.5, longitude: 34.0 },
    { id: '132', name: 'Malaysia', code: 'MY', iso2: 'MY', iso3: 'MYS', phoneCode: '60', latitude: 2.5, longitude: 112.5 },
    { id: '133', name: 'Maldives', code: 'MV', iso2: 'MV', iso3: 'MDV', phoneCode: '960', latitude: 3.25, longitude: 73.0 },
    { id: '134', name: 'Mali', code: 'ML', iso2: 'ML', iso3: 'MLI', phoneCode: '223', latitude: 17.0, longitude: -4.0 },
    { id: '135', name: 'Malta', code: 'MT', iso2: 'MT', iso3: 'MLT', phoneCode: '356', latitude: 35.83, longitude: 14.58 },
    { id: '136', name: 'Marshall Islands', code: 'MH', iso2: 'MH', iso3: 'MHL', phoneCode: '692', latitude: 9.0, longitude: 168.0 },
    { id: '137', name: 'Martinique', code: 'MQ', iso2: 'MQ', iso3: 'MTQ', phoneCode: '596', latitude: 14.67, longitude: -61.0 },
    { id: '138', name: 'Mauritania', code: 'MR', iso2: 'MR', iso3: 'MRT', phoneCode: '222', latitude: 20.0, longitude: -12.0 },
    { id: '139', name: 'Mauritius', code: 'MU', iso2: 'MU', iso3: 'MUS', phoneCode: '230', latitude: -20.28, longitude: 57.55 },
    { id: '140', name: 'Mayotte', code: 'YT', iso2: 'YT', iso3: 'MYT', phoneCode: '262', latitude: -12.83, longitude: 45.17 },
    { id: '141', name: 'Mexico', code: 'MX', iso2: 'MX', iso3: 'MEX', phoneCode: '52', latitude: 23.0, longitude: -102.0 },
    { id: '142', name: 'Micronesia', code: 'FM', iso2: 'FM', iso3: 'FSM', phoneCode: '691', latitude: 6.92, longitude: 158.25 },
    { id: '143', name: 'Moldova', code: 'MD', iso2: 'MD', iso3: 'MDA', phoneCode: '373', latitude: 47.0, longitude: 29.0 },
    { id: '144', name: 'Monaco', code: 'MC', iso2: 'MC', iso3: 'MCO', phoneCode: '377', latitude: 43.73, longitude: 7.4 },
    { id: '145', name: 'Mongolia', code: 'MN', iso2: 'MN', iso3: 'MNG', phoneCode: '976', latitude: 46.0, longitude: 105.0 },
    { id: '146', name: 'Montenegro', code: 'ME', iso2: 'ME', iso3: 'MNE', phoneCode: '382', latitude: 42.5, longitude: 19.3 },
    { id: '147', name: 'Montserrat', code: 'MS', iso2: 'MS', iso3: 'MSR', phoneCode: '1-664', latitude: 16.75, longitude: -62.2 },
    { id: '148', name: 'Morocco', code: 'MA', iso2: 'MA', iso3: 'MAR', phoneCode: '212', latitude: 32.0, longitude: -5.0 },
    { id: '149', name: 'Mozambique', code: 'MZ', iso2: 'MZ', iso3: 'MOZ', phoneCode: '258', latitude: -18.25, longitude: 35.0 },
    { id: '150', name: 'Myanmar', code: 'MM', iso2: 'MM', iso3: 'MMR', phoneCode: '95', latitude: 22.0, longitude: 98.0 },
    { id: '151', name: 'Namibia', code: 'NA', iso2: 'NA', iso3: 'NAM', phoneCode: '264', latitude: -22.0, longitude: 17.0 },
    { id: '152', name: 'Nauru', code: 'NR', iso2: 'NR', iso3: 'NRU', phoneCode: '674', latitude: -0.53, longitude: 166.92 },
    { id: '153', name: 'Nepal', code: 'NP', iso2: 'NP', iso3: 'NPL', phoneCode: '977', latitude: 28.0, longitude: 84.0 },
    { id: '154', name: 'Netherlands', code: 'NL', iso2: 'NL', iso3: 'NLD', phoneCode: '31', latitude: 52.5, longitude: 5.75 },
    { id: '155', name: 'New Caledonia', code: 'NC', iso2: 'NC', iso3: 'NCL', phoneCode: '687', latitude: -21.5, longitude: 165.5 },
    { id: '156', name: 'New Zealand', code: 'NZ', iso2: 'NZ', iso3: 'NZL', phoneCode: '64', latitude: -41.0, longitude: 174.0 },
    { id: '157', name: 'Nicaragua', code: 'NI', iso2: 'NI', iso3: 'NIC', phoneCode: '505', latitude: 13.0, longitude: -85.0 },
    { id: '158', name: 'Niger', code: 'NE', iso2: 'NE', iso3: 'NER', phoneCode: '227', latitude: 16.0, longitude: 8.0 },
    { id: '159', name: 'Nigeria', code: 'NG', iso2: 'NG', iso3: 'NGA', phoneCode: '234', latitude: 10.0, longitude: 8.0 },
    { id: '160', name: 'Niue', code: 'NU', iso2: 'NU', iso3: 'NIU', phoneCode: '683', latitude: -19.03, longitude: -169.87 },
    { id: '161', name: 'Norfolk Island', code: 'NF', iso2: 'NF', iso3: 'NFK', phoneCode: '672', latitude: -29.04, longitude: 167.95 },
    { id: '162', name: 'North Macedonia', code: 'MK', iso2: 'MK', iso3: 'MKD', phoneCode: '389', latitude: 41.83, longitude: 22.0 },
    { id: '163', name: 'Northern Mariana Islands', code: 'MP', iso2: 'MP', iso3: 'MNP', phoneCode: '1-670', latitude: 15.2, longitude: 145.75 },
    { id: '164', name: 'Norway', code: 'NO', iso2: 'NO', iso3: 'NOR', phoneCode: '47', latitude: 62.0, longitude: 10.0 },
    { id: '165', name: 'Oman', code: 'OM', iso2: 'OM', iso3: 'OMN', phoneCode: '968', latitude: 21.0, longitude: 57.0 },
    { id: '166', name: 'Pakistan', code: 'PK', iso2: 'PK', iso3: 'PAK', phoneCode: '92', latitude: 30.0, longitude: 70.0 },
    { id: '167', name: 'Palau', code: 'PW', iso2: 'PW', iso3: 'PLW', phoneCode: '680', latitude: 7.5, longitude: 134.5 },
    { id: '168', name: 'Palestine, State of', code: 'PS', iso2: 'PS', iso3: 'PSE', phoneCode: '970', latitude: 32.0, longitude: 35.25 },
    { id: '169', name: 'Panama', code: 'PA', iso2: 'PA', iso3: 'PAN', phoneCode: '507', latitude: 9.0, longitude: -80.0 },
    { id: '170', name: 'Papua New Guinea', code: 'PG', iso2: 'PG', iso3: 'PNG', phoneCode: '675', latitude: -6.0, longitude: 147.0 },
    { id: '171', name: 'Paraguay', code: 'PY', iso2: 'PY', iso3: 'PRY', phoneCode: '595', latitude: -23.0, longitude: -58.0 },
    { id: '172', name: 'Peru', code: 'PE', iso2: 'PE', iso3: 'PER', phoneCode: '51', latitude: -10.0, longitude: -76.0 },
    { id: '173', name: 'Philippines', code: 'PH', iso2: 'PH', iso3: 'PHL', phoneCode: '63', latitude: 13.0, longitude: 122.0 },
    { id: '174', name: 'Pitcairn', code: 'PN', iso2: 'PN', iso3: 'PCN', phoneCode: '870', latitude: -24.7, longitude: -127.4 },
    { id: '175', name: 'Poland', code: 'PL', iso2: 'PL', iso3: 'POL', phoneCode: '48', latitude: 52.0, longitude: 20.0 },
    { id: '176', name: 'Portugal', code: 'PT', iso2: 'PT', iso3: 'PRT', phoneCode: '351', latitude: 39.5, longitude: -8.0 },
    { id: '177', name: 'Puerto Rico', code: 'PR', iso2: 'PR', iso3: 'PRI', phoneCode: '1-787', latitude: 18.25, longitude: -66.5 },
    { id: '178', name: 'Qatar', code: 'QA', iso2: 'QA', iso3: 'QAT', phoneCode: '974', latitude: 25.5, longitude: 51.25 },
    { id: '179', name: 'Romania', code: 'RO', iso2: 'RO', iso3: 'ROU', phoneCode: '40', latitude: 46.0, longitude: 25.0 },
    { id: '180', name: 'Russian Federation', code: 'RU', iso2: 'RU', iso3: 'RUS', phoneCode: '7', latitude: 60.0, longitude: 100.0 },
    { id: '181', name: 'Rwanda', code: 'RW', iso2: 'RW', iso3: 'RWA', phoneCode: '250', latitude: -2.0, longitude: 30.0 },
    { id: '182', name: 'Réunion', code: 'RE', iso2: 'RE', iso3: 'REU', phoneCode: '262', latitude: -21.12, longitude: 55.54 },
    { id: '183', name: 'Saint Barthélemy', code: 'BL', iso2: 'BL', iso3: 'BLM', phoneCode: '590', latitude: 17.9, longitude: -62.83 },
    { id: '184', name: 'Saint Helena, Ascension and Tristan da Cunha', code: 'SH', iso2: 'SH', iso3: 'SHN', phoneCode: '290', latitude: -24.14, longitude: -10.0 },
    { id: '185', name: 'Saint Kitts and Nevis', code: 'KN', iso2: 'KN', iso3: 'KNA', phoneCode: '1-869', latitude: 17.33, longitude: -62.75 },
    { id: '186', name: 'Saint Lucia', code: 'LC', iso2: 'LC', iso3: 'LCA', phoneCode: '1-758', latitude: 13.88, longitude: -60.97 },
    { id: '187', name: 'Saint Martin (French part)', code: 'MF', iso2: 'MF', iso3: 'MAF', phoneCode: '590', latitude: 18.08, longitude: -63.95 },
    { id: '188', name: 'Saint Pierre and Miquelon', code: 'PM', iso2: 'PM', iso3: 'SPM', phoneCode: '508', latitude: 46.83, longitude: -56.33 },
    { id: '189', name: 'Saint Vincent and the Grenadines', code: 'VC', iso2: 'VC', iso3: 'VCT', phoneCode: '1-784', latitude: 12.98, longitude: -61.23 },
    { id: '190', name: 'Samoa', code: 'WS', iso2: 'WS', iso3: 'WSM', phoneCode: '685', latitude: -13.58, longitude: -172.33 },
    { id: '191', name: 'San Marino', code: 'SM', iso2: 'SM', iso3: 'SMR', phoneCode: '378', latitude: 43.77, longitude: 12.42 },
    { id: '192', name: 'Sao Tome and Principe', code: 'ST', iso2: 'ST', iso3: 'STP', phoneCode: '239', latitude: 1.0, longitude: 7.0 },
    { id: '193', name: 'Saudi Arabia', code: 'SA', iso2: 'SA', iso3: 'SAU', phoneCode: '966', latitude: 25.0, longitude: 45.0 },
    { id: '194', name: 'Senegal', code: 'SN', iso2: 'SN', iso3: 'SEN', phoneCode: '221', latitude: 14.0, longitude: -14.0 },
    { id: '195', name: 'Serbia', code: 'RS', iso2: 'RS', iso3: 'SRB', phoneCode: '381', latitude: 44.0, longitude: 21.0 },
    { id: '196', name: 'Seychelles', code: 'SC', iso2: 'SC', iso3: 'SYC', phoneCode: '248', latitude: -4.58, longitude: 55.67 },
    { id: '197', name: 'Sierra Leone', code: 'SL', iso2: 'SL', iso3: 'SLE', phoneCode: '232', latitude: 8.5, longitude: -11.5 },
    { id: '198', name: 'Singapore', code: 'SG', iso2: 'SG', iso3: 'SGP', phoneCode: '65', latitude: 1.37, longitude: 103.8 },
    { id: '199', name: 'Sint Maarten (Dutch part)', code: 'SX', iso2: 'SX', iso3: 'SXM', phoneCode: '1-721', latitude: 18.03, longitude: -63.05 },
    { id: '200', name: 'Slovakia', code: 'SK', iso2: 'SK', iso3: 'SVK', phoneCode: '421', latitude: 48.67, longitude: 19.5 },
    { id: '201', name: 'Slovenia', code: 'SI', iso2: 'SI', iso3: 'SVN', phoneCode: '386', latitude: 46.12, longitude: 14.82 },
    { id: '202', name: 'Solomon Islands', code: 'SB', iso2: 'SB', iso3: 'SLB', phoneCode: '677', latitude: -8.0, longitude: 159.0 },
    { id: '203', name: 'Somalia', code: 'SO', iso2: 'SO', iso3: 'SOM', phoneCode: '252', latitude: 10.0, longitude: 49.0 },
    { id: '204', name: 'South Africa', code: 'ZA', iso2: 'ZA', iso3: 'ZAF', phoneCode: '27', latitude: -29.0, longitude: 24.0 },
    { id: '205', name: 'South Georgia and the South Sandwich Islands', code: 'GS', iso2: 'GS', iso3: 'SGS', phoneCode: '500', latitude: -54.5, longitude: -37.0 },
    { id: '206', name: 'South Sudan', code: 'SS', iso2: 'SS', iso3: 'SSD', phoneCode: '211', latitude: 8.0, longitude: 30.0 },
    { id: '207', name: 'Spain', code: 'ES', iso2: 'ES', iso3: 'ESP', phoneCode: '34', latitude: 40.0, longitude: -4.0 },
    { id: '208', name: 'Sri Lanka', code: 'LK', iso2: 'LK', iso3: 'LKA', phoneCode: '94', latitude: 7.0, longitude: 81.0 },
    { id: '209', name: 'Sudan', code: 'SD', iso2: 'SD', iso3: 'SDN', phoneCode: '249', latitude: 15.0, longitude: 30.0 },
    { id: '210', name: 'Suriname', code: 'SR', iso2: 'SR', iso3: 'SUR', phoneCode: '597', latitude: 4.0, longitude: -56.0 },
    { id: '211', name: 'Svalbard and Jan Mayen', code: 'SJ', iso2: 'SJ', iso3: 'SJM', phoneCode: '47', latitude: 78.0, longitude: 20.0 },
    { id: '212', name: 'Sweden', code: 'SE', iso2: 'SE', iso3: 'SWE', phoneCode: '46', latitude: 62.0, longitude: 15.0 },
    { id: '213', name: 'Switzerland', code: 'CH', iso2: 'CH', iso3: 'CHE', phoneCode: '41', latitude: 47.0, longitude: 8.0 },
    { id: '214', name: 'Syrian Arab Republic', code: 'SY', iso2: 'SY', iso3: 'SYR', phoneCode: '963', latitude: 35.0, longitude: 38.0 },
    { id: '215', name: 'Taiwan', code: 'TW', iso2: 'TW', iso3: 'TWN', phoneCode: '886', latitude: 23.5, longitude: 121.0 },
    { id: '216', name: 'Tajikistan', code: 'TJ', iso2: 'TJ', iso3: 'TJK', phoneCode: '992', latitude: 39.0, longitude: 71.0 },
    { id: '217', name: 'Tanzania', code: 'TZ', iso2: 'TZ', iso3: 'TZA', phoneCode: '255', latitude: -6.0, longitude: 35.0 },
    { id: '218', name: 'Thailand', code: 'TH', iso2: 'TH', iso3: 'THA', phoneCode: '66', latitude: 15.0, longitude: 100.0 },
    { id: '219', name: 'Timor-Leste', code: 'TL', iso2: 'TL', iso3: 'TLS', phoneCode: '670', latitude: -8.83, longitude: 125.92 },
    { id: '220', name: 'Togo', code: 'TG', iso2: 'TG', iso3: 'TGO', phoneCode: '228', latitude: 8.0, longitude: 1.17 },
    { id: '221', name: 'Tokelau', code: 'TK', iso2: 'TK', iso3: 'TKL', phoneCode: '690', latitude: -8.97, longitude: -171.85 },
    { id: '222', name: 'Tonga', code: 'TO', iso2: 'TO', iso3: 'TON', phoneCode: '676', latitude: -20.0, longitude: -175.0 },
    { id: '223', name: 'Trinidad and Tobago', code: 'TT', iso2: 'TT', iso3: 'TTO', phoneCode: '1-868', latitude: 11.0, longitude: -61.0 },
    { id: '224', name: 'Tunisia', code: 'TN', iso2: 'TN', iso3: 'TUN', phoneCode: '216', latitude: 34.0, longitude: 9.0 },
    { id: '225', name: 'Turkey', code: 'TR', iso2: 'TR', iso3: 'TUR', phoneCode: '90', latitude: 39.0, longitude: 35.0 },
    { id: '226', name: 'Turkmenistan', code: 'TM', iso2: 'TM', iso3: 'TKM', phoneCode: '993', latitude: 40.0, longitude: 60.0 },
    { id: '227', name: 'Turks and Caicos Islands', code: 'TC', iso2: 'TC', iso3: 'TCA', phoneCode: '1-649', latitude: 21.75, longitude: -71.58 },
    { id: '228', name: 'Tuvalu', code: 'TV', iso2: 'TV', iso3: 'TUV', phoneCode: '688', latitude: -8.0, longitude: 178.0 },
    { id: '229', name: 'Uganda', code: 'UG', iso2: 'UG', iso3: 'UGA', phoneCode: '256', latitude: 1.0, longitude: 32.0 },
    { id: '230', name: 'Ukraine', code: 'UA', iso2: 'UA', iso3: 'UKR', phoneCode: '380', latitude: 49.0, longitude: 32.0 },
    { id: '231', name: 'United Arab Emirates', code: 'AE', iso2: 'AE', iso3: 'ARE', phoneCode: '971', latitude: 24.0, longitude: 54.0 },
    { id: '232', name: 'United Kingdom', code: 'GB', iso2: 'GB', iso3: 'GBR', phoneCode: '44', latitude: 54.0, longitude: -2.0 },
    { id: '233', name: 'United States', code: 'US', iso2: 'US', iso3: 'USA', phoneCode: '1', latitude: 38.0, longitude: -97.0 },
    { id: '234', name: 'United States Minor Outlying Islands', code: 'UM', iso2: 'UM', iso3: 'UMI', phoneCode: '1', latitude: 19.28, longitude: 166.65 },
    { id: '235', name: 'Uruguay', code: 'UY', iso2: 'UY', iso3: 'URY', phoneCode: '598', latitude: -33.0, longitude: -56.0 },
    { id: '236', name: 'Uzbekistan', code: 'UZ', iso2: 'UZ', iso3: 'UZB', phoneCode: '998', latitude: 41.0, longitude: 64.0 },
    { id: '237', name: 'Vanuatu', code: 'VU', iso2: 'VU', iso3: 'VUT', phoneCode: '678', latitude: -16.0, longitude: 167.0 },
    { id: '238', name: 'Venezuela', code: 'VE', iso2: 'VE', iso3: 'VEN', phoneCode: '58', latitude: 8.0, longitude: -66.0 },
    { id: '239', name: 'Vietnam', code: 'VN', iso2: 'VN', iso3: 'VNM', phoneCode: '84', latitude: 16.17, longitude: 107.83 },
    { id: '240', name: 'Virgin Islands, British', code: 'VG', iso2: 'VG', iso3: 'VGB', phoneCode: '1-284', latitude: 18.43, longitude: -64.62 },
    { id: '241', name: 'Virgin Islands, U.S.', code: 'VI', iso2: 'VI', iso3: 'VIR', phoneCode: '1-340', latitude: 18.34, longitude: -64.93 },
    { id: '242', name: 'Wallis and Futuna', code: 'WF', iso2: 'WF', iso3: 'WLF', phoneCode: '681', latitude: -13.77, longitude: -177.16 },
    { id: '243', name: 'Western Sahara', code: 'EH', iso2: 'EH', iso3: 'ESH', phoneCode: '212', latitude: 24.22, longitude: -12.89 },
    { id: '244', name: 'Yemen', code: 'YE', iso2: 'YE', iso3: 'YEM', phoneCode: '967', latitude: 15.0, longitude: 48.0 },
    { id: '245', name: 'Zambia', code: 'ZM', iso2: 'ZM', iso3: 'ZMB', phoneCode: '260', latitude: -15.0, longitude: 30.0 },
    { id: '246', name: 'Zimbabwe', code: 'ZW', iso2: 'ZW', iso3: 'ZWE', phoneCode: '263', latitude: -20.0, longitude: 30.0 }
  ];

  async seed(): Promise<void> {
    console.log('🌍 Starting countries seeding...');

    let created = 0;
    let skipped = 0;

    for (const countryData of this.countriesData) {
      const existingCountry = await this.countryRepository.findOne({
        where: { id: countryData.id }
      });

      if (!existingCountry) {
        const country = this.countryRepository.create(countryData);
        await this.countryRepository.save(country);
        created++;
        if (created % 50 === 0) {
          console.log(`   ✅ Created ${created} countries so far...`);
        }
      } else {
        skipped++;
      }
    }

    console.log('✅ Countries seeding completed!');
    console.log(`📊 Results: ${created} created, ${skipped} skipped, ${this.countriesData.length} total`);
  }

  async seedIfEmpty(): Promise<void> {
    console.log('🔍 Checking if countries seeding is needed...');

    const existingCount = await this.countryRepository.count();

    if (existingCount === 0) {
      console.log(`📋 Found ${existingCount} countries. Running seeder...`);
      await this.seed();
    } else {
      console.log(`ℹ️  Found ${existingCount} countries. Skipping seeder.`);
    }
  }

  async reseed(): Promise<void> {
    console.log('🔄 Reseeding countries (this may create duplicates if data already exists)...');
    await this.seed();
  }

  async clearAndReseed(): Promise<void> {
    console.log('🗑️  Clearing existing countries...');

    try {
      await this.countryRepository.query('DELETE FROM countries');
      console.log('✅ Cleared existing countries. Running fresh seed...');
      await this.seed();
    } catch (error) {
      console.error('❌ Clear and reseed failed:', error);
      throw error;
    }
  }
}