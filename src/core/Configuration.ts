const priority = {
  lowest: 1,
  middle: 2,
  highest: 3,
};
const mutations = {
  DESTROY: 'DESTROY',
  MUTATE: 'MUTATE',
};

const actions = {
  STAY: 'STAY',
  COLLAPSE: 'COLLAPSE',
};

const DESTRUCTION_SHAPES = {
  SELF: 'SELF',
  CUSTOM: 'CUSTOM',
  CIRCLE: 'CIRCLE',
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL',

  BY_COLOR:  'BY_COLOR',
}

const FREQUENCY = {
  LOWEST: 1,
  HIGHEST: 3
}

const CELL_CONTENT_TYPES = {
  NONE: 'NONE',
  GENERATOR: 'GENERATOR',
  ENTITY: 'ENTITY'
}

const config = {
  figures: [
    {
      name: 'SIMPLE_GREEN',
      mutationPriority: priority.lowest,
      shape: {
        main: [[1, 1, 1]],
        variations: [],
      },
      // mutationResult: mutations.DESTROY,
      onMatch: mutations.DESTROY,
      whenMatched: mutations.MUTATE,
      whenMutated: actions.STAY,

      whenActivated: {
        do: [
          {
            type: ACTIVATION_TYPE.DESTRUCT,
            shape:  DESTRUCTION_SHAPES.SELF,
            direction: '',
            aftereffect: 
          }
        ],
      }
    },

    {
      name: 'BOMB',
      mutationPriority: priority.middle,
      shape: {
        main: [
          [1, 1, 1],
          [1, 0, 0],
          [1, 0, 0],
        ],
        variations: [
          [
            [0, 1, 0, 0],
            [0, 1, 1, 1],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
          ],
          [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
          ],
          [
            [0, 1, 0, 0],
            [1, 1, 1, 1],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
          ],
        ],
      },
      whenMatched: mutations.MUTATE,
      whenMutated: actions.STAY,

      whenActivated: {
        do: [
          {
            type: ACTIVATION_TYPE.DESTRUCT,
            shape: DESTRUCTION_SHAPES.CUSTOM
          }
        ],
      }
      onSameMerge:  
    },
  ],
  protectors: [
    {
      type: 'CHAIN_1',
      image_url: 'https://to.some.image/chain/for/example1',
      // destructOn: 'ACTIVATE'
    },
    {
      type: 'CHAIN_2',
      image_url: 'https://to.some.image/chain/for/example2'
    }
  ],
  generators: [
    {
      name: 'GENERATOR_1 --WHATEVER_NAME_USER_PROVIDES. UNIQUE!',
      produces: [
        { figure: 'SIMPLE_GREEN', frequency: FREQUENCY.HIGHEST },
        { figure: 'SIMPLE_RED', frequency: FREQUENCY.HIGHEST },
        { figure: 'BOMB', frequency: FREQUENCY.LOWEST}
      ]
    }
  ],
  field: {
    width: 8,
    height: 7,
    cells: [
      [{
        content: {
          type: CELL_CONTENT_TYPES.GENERATOR,
          name: 'GENERATOR_1'
        },
        protectors: [],
        gravity: {
          direction: {
            main: 'BOTTOM',
            alternative: []
          }
        },
      },
      {
        content: {
          type: CELL_CONTENT_TYPES.ENTITY,
          name: 'SIMPLE_GREEN'
        },
        protectors: [ 'CHAIN_1', 'CHAIN_2'],
        gravity: {
          direction: {
            main: 'BOTTOM',
            alternative: ['BOTTOM_LEFT', 'BOTTOM_RIGHT']
          }
        }
      },
      {
        content: {
          type: CELL_CONTENT_TYPES.NONE,
          name: ''
        },
        protectors: [],
        gravity: {
          direction: {
            main: 'NONE',
            alternative: []
          }
        }
      },
    ]
    ]
  }
};
