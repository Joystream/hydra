"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationIdLoader = void 0;
var RelationMetadata_1 = require("typeorm/metadata/RelationMetadata");
/**
 * Loads relation ids for the given entities.
 */
var RelationIdLoader = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function RelationIdLoader(connection) {
        this.connection = connection;
    }
    /**
     * Loads relation ids of the given entity or entities.
     */
    RelationIdLoader.prototype.load = function (relationOrTarget, relationNameOrEntities, entitiesOrRelatedEntities, maybeRelatedEntities) {
        return __awaiter(this, void 0, void 0, function () {
            var relation, entities, relatedEntities, entityMetadata;
            return __generator(this, function (_a) {
                if (relationOrTarget instanceof RelationMetadata_1.RelationMetadata) {
                    relation = relationOrTarget;
                    entities = Array.isArray(relationNameOrEntities)
                        ? relationNameOrEntities
                        : [relationNameOrEntities];
                    relatedEntities = Array.isArray(entitiesOrRelatedEntities)
                        ? entitiesOrRelatedEntities
                        : entitiesOrRelatedEntities
                            ? [entitiesOrRelatedEntities]
                            : undefined;
                }
                else {
                    entityMetadata = this.connection.getMetadata(relationOrTarget);
                    relation = entityMetadata.findRelationWithPropertyPath(relationNameOrEntities);
                    if (!relation)
                        throw new Error("Relation \"" + relation + "\" was not found in \"" + entityMetadata.name + "\".");
                    entities = Array.isArray(entitiesOrRelatedEntities)
                        ? entitiesOrRelatedEntities
                        : [entitiesOrRelatedEntities];
                    relatedEntities = Array.isArray(maybeRelatedEntities)
                        ? maybeRelatedEntities
                        : maybeRelatedEntities
                            ? [maybeRelatedEntities]
                            : undefined;
                }
                // load relation ids depend of relation type
                if (relation.isManyToMany) {
                    return [2 /*return*/, this.loadForManyToMany(relation, entities, relatedEntities)];
                }
                else if (relation.isManyToOne || relation.isOneToOneOwner) {
                    return [2 /*return*/, this.loadForManyToOneAndOneToOneOwner(relation, entities, relatedEntities)];
                }
                else {
                    // if (relation.isOneToMany || relation.isOneToOneNotOwner) {
                    return [2 /*return*/, this.loadForOneToManyAndOneToOneNotOwner(relation, entities, relatedEntities)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Loads relation ids of the given entities and groups them into the object with parent and children.
     *
     * todo: extract this method?
     */
    RelationIdLoader.prototype.loadManyToManyRelationIdsAndGroup = function (relation, entitiesOrEntities, relatedEntityOrEntities) {
        return __awaiter(this, void 0, void 0, function () {
            var isMany, entities, relationIds, relatedEntities, columns, inverseColumns;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isMany = relation.isManyToMany || relation.isOneToMany;
                        entities = Array.isArray(entitiesOrEntities)
                            ? entitiesOrEntities
                            : [entitiesOrEntities];
                        if (!!relatedEntityOrEntities) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.connection.relationLoader.load(relation, entitiesOrEntities)];
                    case 1:
                        relatedEntityOrEntities = _a.sent();
                        if (!relatedEntityOrEntities.length)
                            return [2 /*return*/, entities.map(function (entity) { return ({ entity: entity, related: isMany ? [] : undefined }); })];
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.load(relation, entitiesOrEntities, relatedEntityOrEntities)];
                    case 3:
                        relationIds = _a.sent();
                        relatedEntities = Array.isArray(relatedEntityOrEntities)
                            ? relatedEntityOrEntities
                            : [relatedEntityOrEntities];
                        if (relation.isManyToManyOwner) {
                            columns = relation.junctionEntityMetadata.inverseColumns.map(function (column) { return column.referencedColumn; });
                            inverseColumns = relation.junctionEntityMetadata.ownerColumns.map(function (column) { return column.referencedColumn; });
                        }
                        else if (relation.isManyToManyNotOwner) {
                            columns = relation.junctionEntityMetadata.ownerColumns.map(function (column) { return column.referencedColumn; });
                            inverseColumns = relation.junctionEntityMetadata.inverseColumns.map(function (column) { return column.referencedColumn; });
                        }
                        else if (relation.isManyToOne || relation.isOneToOneOwner) {
                            columns = relation.joinColumns.map(function (column) { return column.referencedColumn; });
                            inverseColumns = relation.entityMetadata.primaryColumns;
                        }
                        else if (relation.isOneToMany || relation.isOneToOneNotOwner) {
                            columns = relation.inverseRelation.entityMetadata.primaryColumns;
                            inverseColumns = relation.inverseRelation.joinColumns.map(function (column) { return column.referencedColumn; });
                        }
                        return [2 /*return*/, entities.map(function (entity) {
                                var group = {
                                    entity: entity,
                                    related: isMany ? [] : undefined
                                };
                                relationIds.forEach(function (relationId) {
                                    var entityMatched = inverseColumns.every(function (column) {
                                        return (column.getEntityValue(entity) ===
                                            relationId[column.entityMetadata.name + '_' + column.propertyPath.replace('.', '_')]);
                                    });
                                    if (entityMatched) {
                                        relatedEntities.forEach(function (relatedEntity) {
                                            var relatedEntityMatched = columns.every(function (column) {
                                                return (column.getEntityValue(relatedEntity) ===
                                                    relationId[column.entityMetadata.name +
                                                        '_' +
                                                        relation.propertyPath.replace('.', '_') +
                                                        '_' +
                                                        column.propertyPath.replace('.', '_')]);
                                            });
                                            if (relatedEntityMatched) {
                                                if (isMany) {
                                                    group.related.push(relatedEntity);
                                                }
                                                else {
                                                    group.related = relatedEntity;
                                                }
                                            }
                                        });
                                    }
                                });
                                return group;
                            })];
                }
            });
        });
    };
    /**
     * Loads relation ids of the given entities and maps them into the given entity property.
  
     async loadManyToManyRelationIdsAndMap(
     relation: RelationMetadata,
     entityOrEntities: ObjectLiteral|ObjectLiteral[],
     mapToEntityOrEntities: ObjectLiteral|ObjectLiteral[],
     propertyName: string
     ): Promise<void> {
  
          const relationIds = await this.loadManyToManyRelationIds(relation, entityOrEntities, mapToEntityOrEntities);
          const mapToEntities = mapToEntityOrEntities instanceof Array ? mapToEntityOrEntities : [mapToEntityOrEntities];
          const junctionMetadata = relation.junctionEntityMetadata!;
          const mainAlias = junctionMetadata.name;
          const columns = relation.isOwning ? junctionMetadata.inverseColumns : junctionMetadata.ownerColumns;
          const inverseColumns = relation.isOwning ? junctionMetadata.ownerColumns : junctionMetadata.inverseColumns;
  
          mapToEntities.forEach(mapToEntity => {
              mapToEntity[propertyName] = [];
              relationIds.forEach(relationId => {
                  const match = inverseColumns.every(column => {
                      return column.referencedColumn!.getEntityValue(mapToEntity) === relationId[mainAlias + "_" + column.propertyName];
                  });
                  if (match) {
                      if (columns.length === 1) {
                          mapToEntity[propertyName].push(relationId[mainAlias + "_" + columns[0].propertyName]);
  
                      } else {
                          const value = {};
                          columns.forEach(column => {
                              column.referencedColumn!.setEntityValue(value, relationId[mainAlias + "_" + column.propertyName]);
                          });
                          mapToEntity[propertyName].push(value);
                      }
                  }
              });
          });
      }*/
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Loads relation ids for the many-to-many relation.
     */
    RelationIdLoader.prototype.loadForManyToMany = function (relation, entities, relatedEntities) {
        var junctionMetadata = relation.junctionEntityMetadata;
        var mainAlias = junctionMetadata.name;
        var columns = relation.isOwning
            ? junctionMetadata.ownerColumns
            : junctionMetadata.inverseColumns;
        var inverseColumns = relation.isOwning
            ? junctionMetadata.inverseColumns
            : junctionMetadata.ownerColumns;
        var qb = this.connection.createQueryBuilder();
        // select all columns from junction table
        junctionMetadata.ownerColumns.forEach(function (column) {
            var columnName = column.referencedColumn.entityMetadata.name +
                '_' +
                column.referencedColumn.propertyPath.replace('.', '_');
            qb.addSelect(mainAlias + '.' + column.propertyPath, columnName);
        });
        junctionMetadata.inverseColumns.forEach(function (column) {
            var columnName = column.referencedColumn.entityMetadata.name +
                '_' +
                relation.propertyPath.replace('.', '_') +
                '_' +
                column.referencedColumn.propertyPath.replace('.', '_');
            qb.addSelect(mainAlias + '.' + column.propertyPath, columnName);
        });
        // add conditions for the given entities
        var condition1 = '';
        if (columns.length === 1) {
            qb.setParameter('values1', entities.map(function (entity) { return columns[0].referencedColumn.getEntityValue(entity); }));
            condition1 = mainAlias + '.' + columns[0].propertyPath + ' IN (:...values1)'; // todo: use ANY for postgres
        }
        else {
            condition1 =
                '(' +
                    entities
                        .map(function (entity, entityIndex) {
                        return columns
                            .map(function (column) {
                            var paramName = 'entity1_' + entityIndex + '_' + column.propertyName;
                            qb.setParameter(paramName, column.referencedColumn.getEntityValue(entity));
                            return mainAlias + '.' + column.propertyPath + ' = :' + paramName;
                        })
                            .join(' AND ');
                    })
                        .map(function (condition) { return '(' + condition + ')'; })
                        .join(' OR ') +
                    ')';
        }
        // add conditions for the given inverse entities
        var condition2 = '';
        if (relatedEntities) {
            if (inverseColumns.length === 1) {
                qb.setParameter('values2', relatedEntities.map(function (entity) { return inverseColumns[0].referencedColumn.getEntityValue(entity); }));
                condition2 = mainAlias + '.' + inverseColumns[0].propertyPath + ' IN (:...values2)'; // todo: use ANY for postgres
            }
            else {
                condition2 =
                    '(' +
                        relatedEntities
                            .map(function (entity, entityIndex) {
                            return inverseColumns
                                .map(function (column) {
                                var paramName = 'entity2_' + entityIndex + '_' + column.propertyName;
                                qb.setParameter(paramName, column.referencedColumn.getEntityValue(entity));
                                return mainAlias + '.' + column.propertyPath + ' = :' + paramName;
                            })
                                .join(' AND ');
                        })
                            .map(function (condition) { return '(' + condition + ')'; })
                            .join(' OR ') +
                        ')';
            }
        }
        // execute query
        return qb
            .from(junctionMetadata.target, mainAlias)
            .where(condition1 + (condition2 ? ' AND ' + condition2 : ''))
            .getRawMany();
    };
    /**
     * Loads relation ids for the many-to-one and one-to-one owner relations.
     */
    RelationIdLoader.prototype.loadForManyToOneAndOneToOneOwner = function (relation, entities, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    relatedEntities) {
        var mainAlias = relation.entityMetadata.targetName;
        // select all columns we need
        var qb = this.connection.createQueryBuilder();
        relation.entityMetadata.primaryColumns.forEach(function (primaryColumn) {
            var columnName = primaryColumn.entityMetadata.name + '_' + primaryColumn.propertyPath.replace('.', '_');
            qb.addSelect(mainAlias + '.' + primaryColumn.propertyPath, columnName);
        });
        relation.joinColumns.forEach(function (column) {
            var columnName = column.referencedColumn.entityMetadata.name +
                '_' +
                relation.propertyPath.replace('.', '_') +
                '_' +
                column.referencedColumn.propertyPath.replace('.', '_');
            qb.addSelect(mainAlias + '.' + column.propertyPath, columnName);
        });
        // add condition for entities
        var condition = '';
        if (relation.entityMetadata.primaryColumns.length === 1) {
            qb.setParameter('values', entities.map(function (entity) { return relation.entityMetadata.primaryColumns[0].getEntityValue(entity); }));
            condition =
                mainAlias +
                    '.' +
                    relation.entityMetadata.primaryColumns[0].propertyPath +
                    ' IN (:...values)';
        }
        else {
            condition = entities
                .map(function (entity, entityIndex) {
                return relation.entityMetadata.primaryColumns
                    .map(function (column, columnIndex) {
                    var paramName = 'entity' + entityIndex + '_' + columnIndex;
                    qb.setParameter(paramName, column.getEntityValue(entity));
                    return mainAlias + '.' + column.propertyPath + ' = :' + paramName;
                })
                    .join(' AND ');
            })
                .map(function (condition) { return '(' + condition + ')'; })
                .join(' OR ');
        }
        // execute query
        return qb
            .from(relation.entityMetadata.target, mainAlias)
            .where(condition)
            .getRawMany();
    };
    /**
     * Loads relation ids for the one-to-many and one-to-one not owner relations.
     */
    RelationIdLoader.prototype.loadForOneToManyAndOneToOneNotOwner = function (relation, entities, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    relatedEntities) {
        relation = relation.inverseRelation;
        var mainAlias = relation.entityMetadata.targetName;
        // select all columns we need
        var qb = this.connection.createQueryBuilder();
        relation.entityMetadata.primaryColumns.forEach(function (primaryColumn) {
            var columnName = primaryColumn.entityMetadata.name +
                '_' +
                relation.inverseRelation.propertyPath.replace('.', '_') +
                '_' +
                primaryColumn.propertyPath.replace('.', '_');
            qb.addSelect(mainAlias + '.' + primaryColumn.propertyPath, columnName);
        });
        relation.joinColumns.forEach(function (column) {
            var columnName = column.referencedColumn.entityMetadata.name +
                '_' +
                column.referencedColumn.propertyPath.replace('.', '_');
            qb.addSelect(mainAlias + '.' + column.propertyPath, columnName);
        });
        // add condition for entities
        var condition = '';
        if (relation.joinColumns.length === 1) {
            qb.setParameter('values', entities.map(function (entity) { return relation.joinColumns[0].referencedColumn.getEntityValue(entity); }));
            condition = mainAlias + '.' + relation.joinColumns[0].propertyPath + ' IN (:...values)';
        }
        else {
            condition = entities
                .map(function (entity, entityIndex) {
                return relation.joinColumns
                    .map(function (joinColumn, joinColumnIndex) {
                    var paramName = 'entity' + entityIndex + '_' + joinColumnIndex;
                    qb.setParameter(paramName, joinColumn.referencedColumn.getEntityValue(entity));
                    return mainAlias + '.' + joinColumn.propertyPath + ' = :' + paramName;
                })
                    .join(' AND ');
            })
                .map(function (condition) { return '(' + condition + ')'; })
                .join(' OR ');
        }
        // execute query
        return qb
            .from(relation.entityMetadata.target, mainAlias)
            .where(condition)
            .getRawMany();
    };
    return RelationIdLoader;
}());
exports.RelationIdLoader = RelationIdLoader;
//# sourceMappingURL=RelationIdLoader.js.map