export const accountData = {
  data: {
    type: 'account',
    attributes: {
      'account-type': 'custodial',
      name: 'Skopas Account',
      'authorized-signature': 'Skopas New',
      owner: {
        'contact-type': 'natural_person',
        name: 'Owner Name',
        email: 'test453_sd@gmail.com',
        'tax-id-number': '23',
        'tax-country': 'US',
        'date-of-birth': '1980-06-09',
        sex: 'male',
        'primary-phone-number': {
          country: 'US',
          number: '1231231231',
          sms: true,
        },
        'primary-address': {
          'street-1': '123 MK Road',
          'street-2': 'Flat 3',
          'postal-code': '89145',
          city: 'Las Vegas',
          region: 'NVA',
          country: 'US',
        },
      },
    },
  },
};
