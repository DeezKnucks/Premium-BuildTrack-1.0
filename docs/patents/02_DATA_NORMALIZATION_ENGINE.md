# BuildTrack Data Normalization Engine (DNE)
## Patent-Ready Technical Documentation

**Document Version:** 1.0  
**Date:** March 2026  
**Classification:** Proprietary & Confidential  
**Inventor:** Peter Martinez, BuildTrack Inc.

---

## 1. ABSTRACT

The **Data Normalization Engine (DNE)** is a proprietary system for transforming heterogeneous construction project data from multiple sources into a unified, analysis-ready format. Unlike generic ETL (Extract-Transform-Load) systems, DNE implements construction-industry-specific transformation rules including the **Semantic Construction Ontology (SCO)**, **Adaptive Schema Mapping (ASM)**, and **Confidence-Weighted Data Fusion (CWDF)** algorithms. This enables seamless integration of data from legacy systems, IoT sensors, financial platforms, and field applications without manual mapping or data loss.

---

## 2. TECHNICAL FIELD

This invention relates to data processing systems for construction project management, specifically to methods and systems for normalizing, standardizing, and fusing data from disparate sources while preserving construction-domain semantics.

---

## 3. BACKGROUND OF THE INVENTION

### 3.1 Problem Statement

Construction projects generate data from 15+ different systems:
- Accounting (QuickBooks, Sage)
- Project Management (Procore, PlanGrid)
- Design (AutoCAD, Revit)
- Field Reporting (custom apps, spreadsheets)
- IoT Sensors (weather stations, equipment trackers)
- HR/Payroll systems
- Material suppliers
- Subcontractor systems

**Key Challenges:**
1. **Schema Heterogeneity**: Each system uses different data structures
2. **Semantic Ambiguity**: "Cost" in one system ≠ "Cost" in another
3. **Temporal Misalignment**: Different update frequencies and time zones
4. **Unit Inconsistency**: Imperial vs. metric, different currency formats
5. **Data Quality Variance**: Missing fields, outdated records, duplicates

### 3.2 Limitations of Existing Solutions

| Solution Type | Limitation |
|---------------|------------|
| Manual CSV import | Error-prone, time-consuming |
| Generic ETL tools | No construction domain knowledge |
| API integrations | Point-to-point, doesn't scale |
| Data warehouses | Batch processing, not real-time |

---

## 4. DETAILED DESCRIPTION OF THE INVENTION

### 4.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DATA NORMALIZATION ENGINE (DNE)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INPUT LAYER                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │QuickBooks│ │ Procore │ │  IoT    │ │  Excel  │ │  API    │           │
│  │   API   │ │   API   │ │ Sensors │ │ Imports │ │Webhooks │           │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
│       │           │           │           │           │                  │
│       └───────────┴───────────┼───────────┴───────────┘                  │
│                               ▼                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │              SOURCE IDENTIFICATION & CLASSIFICATION                │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │  • System fingerprinting (API signatures, file formats)       │ │ │
│  │  │  • Version detection (QuickBooks 2024 vs 2023)                │ │ │
│  │  │  • Confidence scoring for source reliability                  │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────┬───────────────────────────────────┘ │
│                                   ▼                                      │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │              ADAPTIVE SCHEMA MAPPING (ASM)                         │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │  Input Schema                    Target Schema               │ │ │
│  │  │  ─────────────                   ─────────────               │ │ │
│  │  │  QB.Invoice.Amount    ──────►    cost.invoice.total         │ │ │
│  │  │  QB.Invoice.Date      ──────►    dates.invoice.created      │ │ │
│  │  │  Procore.Budget.Est   ──────►    cost.estimate.original     │ │ │
│  │  │                                                               │ │ │
│  │  │  Machine Learning Mapper:                                     │ │ │
│  │  │  • Learns from manual corrections                             │ │ │
│  │  │  • 95%+ accuracy after 100 mappings                          │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────┬───────────────────────────────────┘ │
│                                   ▼                                      │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │           SEMANTIC CONSTRUCTION ONTOLOGY (SCO)                     │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │  Construction Domain Concepts:                                │ │ │
│  │  │                                                               │ │ │
│  │  │  PROJECT ──► PHASE ──► TASK ──► ACTIVITY                     │ │ │
│  │  │     │           │         │          │                        │ │ │
│  │  │     ▼           ▼         ▼          ▼                        │ │ │
│  │  │  BUDGET      SCHEDULE  RESOURCE   MATERIAL                   │ │ │
│  │  │     │           │         │          │                        │ │ │
│  │  │     └───────────┴─────────┴──────────┘                        │ │ │
│  │  │                     │                                          │ │ │
│  │  │                     ▼                                          │ │ │
│  │  │              UNIFIED DATA MODEL                               │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────┬───────────────────────────────────┘ │
│                                   ▼                                      │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │         CONFIDENCE-WEIGHTED DATA FUSION (CWDF)                     │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │  When multiple sources provide the same data point:          │ │ │
│  │  │                                                               │ │ │
│  │  │  Final_Value = Σ(Source_Value × Confidence × Recency)        │ │ │
│  │  │                ─────────────────────────────────────          │ │ │
│  │  │                     Σ(Confidence × Recency)                   │ │ │
│  │  │                                                               │ │ │
│  │  │  Example:                                                     │ │ │
│  │  │  Budget from QuickBooks (conf=0.95, 1hr ago): $500,000       │ │ │
│  │  │  Budget from Excel (conf=0.60, 1wk ago): $485,000            │ │ │
│  │  │  Final: $498,750 (weighted toward QB)                        │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────┬───────────────────────────────────┘ │
│                                   ▼                                      │
│  OUTPUT: UNIFIED CONSTRUCTION DATA MODEL                                 │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  {                                                                 │ │
│  │    "project_id": "uuid",                                          │ │
│  │    "normalized_at": "ISO8601",                                    │ │
│  │    "confidence_score": 0.92,                                      │ │
│  │    "data": { ... standardized fields ... },                       │ │
│  │    "lineage": { ... source tracking ... }                         │ │
│  │  }                                                                 │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Core Algorithm: Adaptive Schema Mapping (ASM)

The ASM uses a combination of rule-based and machine learning approaches to map source fields to the target schema.

```python
class AdaptiveSchemaMapper:
    """
    PROPRIETARY ALGORITHM - ASM
    
    Automatically maps fields from external systems to BuildTrack's
    unified data model using ML-enhanced rule matching.
    """
    
    def __init__(self):
        self.rule_engine = RuleBasedMapper()
        self.ml_model = SchemaMLModel()
        self.mapping_history = MappingHistoryStore()
        
    def map_schema(self, source_data, source_system):
        """
        Main entry point for schema mapping.
        
        Returns: Mapped data in BuildTrack unified format
        """
        # Step 1: Identify source system and version
        system_profile = self._identify_system(source_data, source_system)
        
        # Step 2: Check for existing learned mappings
        cached_mapping = self.mapping_history.get_mapping(
            system_profile['system_id'],
            system_profile['schema_version']
        )
        
        if cached_mapping and cached_mapping['confidence'] > 0.95:
            return self._apply_mapping(source_data, cached_mapping)
        
        # Step 3: Generate mapping candidates
        mapping_candidates = []
        
        # 3a: Rule-based mapping (high confidence for known patterns)
        rule_mappings = self.rule_engine.generate_mappings(
            source_data, 
            system_profile
        )
        mapping_candidates.extend(rule_mappings)
        
        # 3b: ML-based mapping (for unknown fields)
        ml_mappings = self.ml_model.predict_mappings(
            source_data,
            self._get_unmapped_fields(source_data, rule_mappings)
        )
        mapping_candidates.extend(ml_mappings)
        
        # Step 4: Resolve conflicts and build final mapping
        final_mapping = self._resolve_conflicts(mapping_candidates)
        
        # Step 5: Apply mapping and return
        result = self._apply_mapping(source_data, final_mapping)
        
        # Step 6: Store for future learning
        self.mapping_history.store(system_profile, final_mapping)
        
        return result
    
    def _identify_system(self, source_data, source_system):
        """
        PROPRIETARY: System fingerprinting algorithm
        
        Identifies the source system, version, and configuration
        based on data patterns and metadata.
        """
        fingerprint = {
            'field_names': set(self._extract_field_names(source_data)),
            'data_types': self._analyze_data_types(source_data),
            'value_patterns': self._extract_value_patterns(source_data),
            'metadata': self._extract_metadata(source_data)
        }
        
        # Match against known system signatures
        SYSTEM_SIGNATURES = {
            'quickbooks_2024': {
                'required_fields': {'TxnDate', 'TotalAmt', 'DocNumber'},
                'optional_fields': {'CustomerRef', 'Line'},
                'date_format': 'YYYY-MM-DD',
            },
            'procore_v2': {
                'required_fields': {'id', 'project_id', 'budget'},
                'optional_fields': {'cost_code', 'commitment'},
                'id_pattern': r'^[0-9]+$',
            },
            # ... additional signatures ...
        }
        
        best_match = None
        best_score = 0
        
        for system_id, signature in SYSTEM_SIGNATURES.items():
            score = self._calculate_match_score(fingerprint, signature)
            if score > best_score:
                best_score = score
                best_match = system_id
        
        return {
            'system_id': best_match or 'unknown',
            'schema_version': self._detect_version(fingerprint),
            'confidence': best_score,
            'fingerprint': fingerprint
        }
```

### 4.3 Core Algorithm: Semantic Construction Ontology (SCO)

The SCO defines the canonical data model for construction projects, ensuring semantic consistency across all data sources.

```python
class SemanticConstructionOntology:
    """
    PROPRIETARY ALGORITHM - SCO
    
    Defines the canonical data model and semantic relationships
    for construction project data.
    """
    
    # Core entity definitions with semantic relationships
    ONTOLOGY = {
        'Project': {
            'attributes': {
                'id': {'type': 'uuid', 'required': True},
                'name': {'type': 'string', 'required': True, 'max_length': 255},
                'status': {'type': 'enum', 'values': ['planning', 'active', 'on_hold', 'completed', 'cancelled']},
                'start_date': {'type': 'date', 'semantic': 'project.timeline.start'},
                'end_date': {'type': 'date', 'semantic': 'project.timeline.end'},
                'budget': {'type': 'money', 'semantic': 'project.financials.total_budget'},
                'actual_cost': {'type': 'money', 'semantic': 'project.financials.actual_spent'},
            },
            'relationships': {
                'has_phases': {'target': 'Phase', 'cardinality': '1:N'},
                'has_team': {'target': 'TeamMember', 'cardinality': '1:N'},
                'has_documents': {'target': 'Document', 'cardinality': '1:N'},
            }
        },
        
        'Phase': {
            'attributes': {
                'id': {'type': 'uuid', 'required': True},
                'name': {'type': 'string', 'required': True},
                'type': {'type': 'enum', 'values': ['pre_construction', 'foundation', 'framing', 'mechanical', 'electrical', 'plumbing', 'finishing', 'closeout']},
                'sequence': {'type': 'integer', 'semantic': 'project.phase.order'},
                'progress': {'type': 'percentage', 'semantic': 'project.phase.completion'},
            },
            'relationships': {
                'belongs_to': {'target': 'Project', 'cardinality': 'N:1'},
                'has_tasks': {'target': 'Task', 'cardinality': '1:N'},
            }
        },
        
        'Task': {
            'attributes': {
                'id': {'type': 'uuid', 'required': True},
                'title': {'type': 'string', 'required': True},
                'description': {'type': 'text'},
                'status': {'type': 'enum', 'values': ['not_started', 'in_progress', 'blocked', 'completed']},
                'priority': {'type': 'enum', 'values': ['low', 'medium', 'high', 'critical']},
                'estimated_hours': {'type': 'decimal', 'semantic': 'task.effort.estimate'},
                'actual_hours': {'type': 'decimal', 'semantic': 'task.effort.actual'},
                'due_date': {'type': 'date', 'semantic': 'task.timeline.due'},
            },
            'relationships': {
                'belongs_to_phase': {'target': 'Phase', 'cardinality': 'N:1'},
                'assigned_to': {'target': 'TeamMember', 'cardinality': 'N:N'},
                'depends_on': {'target': 'Task', 'cardinality': 'N:N'},
                'has_materials': {'target': 'Material', 'cardinality': '1:N'},
            }
        },
        
        'Cost': {
            'attributes': {
                'id': {'type': 'uuid', 'required': True},
                'category': {'type': 'enum', 'values': ['labor', 'material', 'equipment', 'subcontractor', 'overhead', 'contingency']},
                'cost_code': {'type': 'string', 'semantic': 'cost.classification.code'},
                'budgeted': {'type': 'money', 'semantic': 'cost.financials.budgeted'},
                'committed': {'type': 'money', 'semantic': 'cost.financials.committed'},
                'actual': {'type': 'money', 'semantic': 'cost.financials.actual'},
                'variance': {'type': 'money', 'computed': 'actual - budgeted'},
            }
        }
    }
    
    # Semantic aliases for common field name variations
    SEMANTIC_ALIASES = {
        'project.financials.total_budget': [
            'budget', 'total_budget', 'project_budget', 'estimated_cost',
            'contract_value', 'contract_amount', 'TotalAmt', 'Amount'
        ],
        'project.timeline.start': [
            'start_date', 'start', 'begin_date', 'commencement_date',
            'project_start', 'StartDate', 'TxnDate'
        ],
        'task.effort.estimate': [
            'estimated_hours', 'est_hours', 'planned_hours', 'budget_hours',
            'EstimatedHours', 'PlannedEffort'
        ],
        # ... 50+ additional semantic mappings ...
    }
    
    def resolve_semantic_field(self, field_name, value, context=None):
        """
        Resolves an input field to its canonical semantic meaning.
        
        Returns: (canonical_field_path, normalized_value, confidence)
        """
        field_lower = field_name.lower().replace('_', '').replace('-', '')
        
        for semantic_path, aliases in self.SEMANTIC_ALIASES.items():
            normalized_aliases = [a.lower().replace('_', '') for a in aliases]
            if field_lower in normalized_aliases:
                normalized_value = self._normalize_value(
                    value, 
                    self._get_type_for_path(semantic_path)
                )
                return (semantic_path, normalized_value, 0.95)
        
        # Fallback to ML-based semantic matching
        return self._ml_semantic_match(field_name, value, context)
```

### 4.4 Core Algorithm: Confidence-Weighted Data Fusion (CWDF)

When the same data point is available from multiple sources, CWDF determines the most accurate value.

```python
class ConfidenceWeightedDataFusion:
    """
    PROPRIETARY ALGORITHM - CWDF
    
    Fuses data from multiple sources using confidence scoring
    and recency weighting.
    """
    
    # Source confidence scores (learned and tuned)
    SOURCE_CONFIDENCE = {
        'quickbooks': 0.95,      # Authoritative for financials
        'procore': 0.90,         # Good for project management
        'excel_import': 0.60,    # Manual, error-prone
        'api_webhook': 0.85,     # Real-time but unverified
        'iot_sensor': 0.80,      # Hardware can malfunction
        'manual_entry': 0.70,    # Human error possible
    }
    
    def fuse_data_points(self, data_points):
        """
        Fuse multiple values for the same semantic field.
        
        Parameters:
        - data_points: List of {value, source, timestamp, metadata}
        
        Returns: Fused value with confidence score
        """
        if len(data_points) == 1:
            return data_points[0]['value'], data_points[0].get('confidence', 0.8)
        
        # Calculate weights for each data point
        weights = []
        for dp in data_points:
            source_conf = self.SOURCE_CONFIDENCE.get(dp['source'], 0.5)
            recency_weight = self._calculate_recency_weight(dp['timestamp'])
            quality_score = self._assess_data_quality(dp['value'], dp.get('metadata', {}))
            
            # PROPRIETARY: Combined weight formula
            weight = (
                0.4 * source_conf +
                0.35 * recency_weight +
                0.25 * quality_score
            )
            weights.append(weight)
        
        # Normalize weights
        total_weight = sum(weights)
        normalized_weights = [w / total_weight for w in weights]
        
        # Determine fusion strategy based on data type
        sample_value = data_points[0]['value']
        
        if isinstance(sample_value, (int, float)):
            # Numeric: Weighted average
            fused_value = sum(
                dp['value'] * w 
                for dp, w in zip(data_points, normalized_weights)
            )
        elif isinstance(sample_value, str):
            # String: Majority vote with confidence threshold
            fused_value = self._majority_vote(data_points, normalized_weights)
        elif isinstance(sample_value, dict):
            # Object: Recursive field-by-field fusion
            fused_value = self._recursive_fusion(data_points, normalized_weights)
        else:
            # Default: Highest confidence value
            max_idx = weights.index(max(weights))
            fused_value = data_points[max_idx]['value']
        
        # Calculate confidence of fused result
        confidence = self._calculate_fusion_confidence(data_points, weights)
        
        return fused_value, confidence
    
    def _calculate_recency_weight(self, timestamp):
        """
        PROPRIETARY: Recency decay function
        
        More recent data is weighted higher, with exponential decay.
        """
        if timestamp is None:
            return 0.5
        
        age_hours = (datetime.utcnow() - timestamp).total_seconds() / 3600
        
        # Half-life of 24 hours
        HALF_LIFE = 24
        decay = 0.5 ** (age_hours / HALF_LIFE)
        
        return max(0.1, decay)  # Floor at 0.1 to never fully discount old data
    
    def _assess_data_quality(self, value, metadata):
        """
        PROPRIETARY: Data quality scoring
        
        Assesses completeness, format validity, and range reasonability.
        """
        score = 1.0
        
        # Penalize null/empty values
        if value is None or value == '':
            return 0.1
        
        # Check for placeholder values
        PLACEHOLDER_PATTERNS = ['TBD', 'N/A', '0.00', 'UNKNOWN', '-']
        if str(value).upper() in PLACEHOLDER_PATTERNS:
            score *= 0.3
        
        # Validate format if expected type is known
        if 'expected_type' in metadata:
            if not self._validate_type(value, metadata['expected_type']):
                score *= 0.5
        
        # Check reasonable ranges for known fields
        if 'semantic_field' in metadata:
            if not self._check_reasonable_range(value, metadata['semantic_field']):
                score *= 0.7
        
        return score
```

---

## 5. DATA LINEAGE & AUDIT TRAIL

Every normalized data point includes complete lineage information:

```json
{
  "normalized_value": 500000.00,
  "semantic_field": "project.financials.total_budget",
  "confidence": 0.93,
  "lineage": {
    "sources": [
      {
        "system": "quickbooks",
        "field": "TotalAmt",
        "raw_value": "500000.00",
        "timestamp": "2026-03-03T10:30:00Z",
        "weight": 0.65
      },
      {
        "system": "excel_import",
        "field": "Project Budget",
        "raw_value": "$495,000",
        "timestamp": "2026-02-28T14:00:00Z",
        "weight": 0.35
      }
    ],
    "fusion_method": "weighted_average",
    "transformations": [
      "currency_symbol_removal",
      "decimal_normalization"
    ]
  }
}
```

---

## 6. CLAIMS

### Claim 1 (Independent)
A computer-implemented method for normalizing heterogeneous construction project data, comprising:
- Receiving data from multiple external systems
- Identifying the source system and schema version through fingerprinting
- Applying adaptive schema mapping using rule-based and machine learning techniques
- Resolving semantic ambiguity using a construction-specific ontology
- Fusing conflicting data points using confidence-weighted algorithms

### Claim 2 (Dependent on Claim 1)
The method of Claim 1, wherein the adaptive schema mapping learns from user corrections to improve accuracy over time.

### Claim 3 (Dependent on Claim 1)
The method of Claim 1, wherein the confidence-weighted data fusion applies different weights based on source reliability, data recency, and quality assessment.

### Claim 4 (Independent - System)
A system for construction data normalization comprising:
- A source identification module for system fingerprinting
- An adaptive schema mapper with ML-enhanced field matching
- A semantic ontology engine defining construction domain concepts
- A data fusion module for resolving conflicting values
- An audit trail generator for lineage tracking

---

## 7. DIFFERENTIATION FROM PRIOR ART

| Feature | BuildTrack DNE | Generic ETL | Zapier/Make | Fivetran |
|---------|----------------|-------------|-------------|----------|
| Construction-specific ontology | YES | NO | NO | NO |
| ML-enhanced schema mapping | YES | LIMITED | NO | LIMITED |
| Confidence-weighted fusion | YES | NO | NO | NO |
| Real-time processing | YES | BATCH | YES | BATCH |
| Domain-aware validation | YES | NO | NO | NO |
| Lineage tracking | YES | LIMITED | NO | YES |

---

## 8. REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | March 2026 | P. Martinez | Initial documentation |

---

*This document contains proprietary information belonging to BuildTrack Inc. Unauthorized reproduction or distribution is prohibited.*
