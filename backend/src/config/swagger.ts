import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WhatShouldIPlay API',
      version: '2.0.0',
      description: 'Modern API for Steam game discovery using GiantBomb data',
      contact: {
        name: 'API Support',
        url: 'https://github.com/yourusername/WhatShouldIPlay',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://${env.HOST}:${env.PORT}`,
        description: 'Development server',
      },
      {
        url: 'https://api.whatshouldip lay.com',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Games',
        description: 'Game discovery and browsing endpoints',
      },
      {
        name: 'Steam',
        description: 'Steam user library integration endpoints',
      },
      {
        name: 'Health',
        description: 'API health and status endpoints',
      },
    ],
    components: {
      schemas: {
        Game: {
          type: 'object',
          properties: {
            gbId: {
              type: 'integer',
              description: 'GiantBomb game ID',
              example: 12345,
            },
            name: {
              type: 'string',
              description: 'Game name',
              example: 'Half-Life 2',
            },
            deck: {
              type: 'string',
              description: 'Short game description',
              example: 'A revolutionary first-person shooter',
            },
            image: {
              type: 'object',
              properties: {
                icon_url: { type: 'string' },
                medium_url: { type: 'string' },
                screen_url: { type: 'string' },
                small_url: { type: 'string' },
                super_url: { type: 'string' },
                thumb_url: { type: 'string' },
                tiny_url: { type: 'string' },
              },
            },
            developers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' },
                  api_detail_url: { type: 'string' },
                },
              },
            },
            genres: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' },
                  api_detail_url: { type: 'string' },
                },
              },
            },
            themes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' },
                  api_detail_url: { type: 'string' },
                },
              },
            },
            concepts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' },
                  api_detail_url: { type: 'string' },
                },
              },
            },
          },
        },
        SteamUser: {
          type: 'object',
          properties: {
            steamID64: {
              type: 'string',
              description: 'Steam 64-bit ID',
              example: '76561198012345678',
            },
            username: {
              type: 'string',
              description: 'Steam username',
              example: 'gamer123',
            },
            realname: {
              type: 'string',
              description: 'User\'s real name (if public)',
              example: 'John Doe',
            },
            avatarIcon: {
              type: 'string',
              description: 'URL to small avatar',
            },
            avatarMedium: {
              type: 'string',
              description: 'URL to medium avatar',
            },
            avatarFull: {
              type: 'string',
              description: 'URL to full avatar',
            },
            gameCount: {
              type: 'integer',
              description: 'Number of owned games',
              example: 150,
            },
            lastUpdated: {
              type: 'string',
              format: 'date-time',
              description: 'Last time data was fetched',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'An error occurred',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            data: {
              type: 'object',
            },
          },
        },
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        BadRequest: {
          description: 'Invalid request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        InternalError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
