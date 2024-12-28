const emojis = require('../../public/emojis.data.json');

module.exports = {
    id: {
        path: "id",
        type: "string",
        length: { min: 1, max: 50 },
    },
    identifier: {
        path: 'identifier',
        type: 'string',
        length: {min: 3, max: 100},
    },
    username: {
        path: 'username',
        type: 'string',
        length: {min: 3, max: 20},
        custom: 'username',
    },
    name: {
        path: 'name',
        type: 'string',
        length: {min: 3, max: 100},
    },
    administrators: {
        path: 'administrators',
        type: 'array',
        length: {min: 1, max: 10},
    },
    password: {
        path: 'password',
        type: 'string',
        length: {min: 8, max: 100},
        rules: [
            { regex: /[A-Z]/, error: 'Password must contain at least one uppercase letter.' },
            { regex: /[a-z]/, error: 'Password must contain at least one lowercase letter.' },
            { regex: /\d/, error: 'Password must contain at least one digit.' },
            { regex: /[@#$!%*?&]/, error: 'Password must contain at least one special character.' },
        ]
    },
    email: {
        path: 'email',
        type: 'string',
        length: {min:3, max: 100},
        regex: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
    website: {
        path: 'website',
        type: 'string',
        length: {min:3, max: 100},
        regex: /^(https?:\/\/)?([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})([\/\w.-]*)*\/?$/
    },
    title: {
        path: 'title',
        type: 'string',
        length: {min: 3, max: 300}
    },
    label: {
        path: 'label',
        type: 'string',
        length: {min: 3, max: 100}
    },
    shortDesc: {
        path: 'desc',
        type: 'string',
        length: {min:3, max: 300}
    },
    longDesc: {
        path: 'desc',
        type: 'string',
        length: {min:3, max: 2000}
    },
    url: {
        path: 'url',
        type: 'string',
        length: {min: 9, max: 300},
    },
    address: {
        path: 'address',
        type: 'string',
        length: {min: 9, max: 300},
    },
    emoji: {
        path: 'emoji',
        type: 'Array',
        items: {
            type: 'string',
            length: {min: 1, max: 10},
            oneOf: emojis.value,
        }
    },
    price: {
        path: 'price',
        type: 'number',
    },
    avatar: {
        path: 'avatar',
        type: 'string',
        length: {min: 8, max: 100},
    },
    text: {
        type: 'String',
        length: {min: 3, max: 15 },
    },
    longText: {
        type: 'String',
        length: {min: 3, max: 250 },
    },
    paragraph: {
        type: 'String',
        length: {min: 3, max:10000},
    },
    phoneNumber: {
        path: 'phoneNumber',
        type: 'string',
        length: {min: 10, max: 14},
        regex: /^\+?(\d{1,3})?[-.\s]?(\(?\d{1,4}\)?)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/
    },
    number: {
        type: 'Number',
        length: {min: 1, max:6},
    },
    arrayOfStrings: {
        type: 'Array',
        items: {
            type: 'String',
            length: { min: 3, max: 100}
        }
    },
    obj: {
        type: 'Object',
    },
    bool: {
        type: 'Boolean',
    },
    role: {
        path: 'role',
        type: 'String',
        length: {min: 3, max:30},
    },
}