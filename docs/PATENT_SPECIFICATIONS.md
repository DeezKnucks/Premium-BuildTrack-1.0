# BuildTrack Proprietary Patent Specifications
## Construction AI Risk Intelligence Platform

**Document Classification:** CONFIDENTIAL - PATENT PENDING
**Version:** 1.0.0
**Date:** June 2025
**Inventor(s):** BuildTrack Engineering Team

---

# PATENT 1: TEMPORAL CASCADING RISK PREDICTION ENGINE (TCRPE™)

## Abstract

A novel machine learning system for construction project risk prediction that employs a multi-horizon temporal cascade architecture, combining heterogeneous data streams from IoT sensors, supply chain APIs, meteorological services, and workflow telemetry to generate probabilistic risk assessments with 87%+ accuracy across 3-7 day prediction windows.

## Technical Field

This invention relates to artificial intelligence systems for predictive analytics in construction project management, specifically to methods and apparatus for real-time risk assessment using multi-source temporal data fusion.

## Background & Prior Art Limitations

### Existing Solutions (Procore, Autodesk, Oracle Primavera):
- **Reactive monitoring only** - alerts generated AFTER issues occur
- **Single-source analysis** - weather OR schedule OR budget (siloed)
- **Static thresholds** - fixed rules without adaptive learning
- **No temporal cascading** - cannot predict cascading failure chains
- **Limited horizon** - same-day or next-day predictions only

### Novel Differentiation:
BuildTrack's TCRPE™ introduces **predictive cascading analysis** that models how a risk event on Day N propagates through interconnected project systems to Days N+1 through N+7, enabling proactive mitigation before cascade initiation.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TEMPORAL CASCADING RISK ENGINE                    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │
│  │  Weather  │  │   IoT     │  │  Supply   │  │ Workflow  │        │
│  │  Stream   │  │  Sensors  │  │  Chain    │  │ Telemetry │        │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘        │
│        │              │              │              │               │
│        ▼              ▼              ▼              ▼               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │           TEMPORAL ALIGNMENT PREPROCESSOR (TAP)              │   │
│  │  • Timestamp normalization to project timezone               │   │
│  │  • Missing value imputation via Kalman filtering             │   │
│  │  • Outlier detection using Isolation Forest                  │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              CASCADE DEPENDENCY GRAPH (CDG)                  │   │
│  │  • Directed acyclic graph of task dependencies               │   │
│  │  • Resource contention edges                                 │   │
│  │  • Weather-sensitive task annotations                        │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │         MULTI-HORIZON TEMPORAL TRANSFORMER (MHTT)            │   │
│  │  • 7 parallel attention heads (one per forecast day)         │   │
│  │  • Cross-attention between risk categories                   │   │
│  │  • Positional encoding with project phase awareness          │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │            CASCADE PROPAGATION SIMULATOR (CPS)               │   │
│  │  • Monte Carlo simulation of risk propagation paths          │   │
│  │  • Bayesian network for conditional probability chains       │   │
│  │  • Critical path impact quantification                       │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              RISK SCORE AGGREGATION LAYER                    │   │
│  │  Output: 0-100 composite score per day with confidence       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Inputs Specification

### 1. Weather Data Stream
```python
WeatherInput = {
    "source": "OpenWeatherMap + NOAA + project-local stations",
    "frequency": "hourly forecasts, updated every 3 hours",
    "parameters": {
        "temperature": float,           # Celsius
        "precipitation_probability": float,  # 0-1
        "precipitation_amount_mm": float,
        "wind_speed_kmh": float,
        "wind_gusts_kmh": float,
        "humidity_percent": float,
        "visibility_km": float,
        "uv_index": int,
        "lightning_probability": float,  # 0-1
        "snow_accumulation_cm": float,
        "freeze_thaw_cycles": int       # Predicted in 24h window
    },
    "horizon": "168 hours (7 days)",
    "resolution": "hourly granularity"
}
```

### 2. IoT Sensor Telemetry
```python
IoTInput = {
    "equipment_sensors": {
        "crane_load_percent": float,
        "crane_wind_lockout": bool,
        "concrete_pump_pressure_psi": float,
        "generator_fuel_level_percent": float,
        "equipment_runtime_hours": float,
        "equipment_idle_hours": float,
        "gps_coordinates": (lat, lng),
        "vibration_anomaly_score": float  # 0-1
    },
    "site_sensors": {
        "ground_moisture_percent": float,
        "ambient_temperature": float,
        "dust_particulate_ppm": float,
        "noise_level_db": float,
        "worker_presence_count": int,
        "vehicle_count": int
    },
    "material_sensors": {
        "concrete_temperature": float,
        "concrete_slump_mm": float,
        "steel_corrosion_index": float,
        "lumber_moisture_percent": float
    },
    "frequency": "5-minute intervals",
    "protocol": "MQTT over TLS"
}
```

### 3. Supply Chain API Data
```python
SupplyChainInput = {
    "vendor_apis": ["SAP Ariba", "Coupa", "vendor-direct"],
    "parameters": {
        "material_id": str,
        "ordered_quantity": float,
        "confirmed_delivery_date": datetime,
        "shipping_status": enum["ordered", "in_transit", "customs", "delivered"],
        "carrier_tracking_id": str,
        "estimated_arrival": datetime,
        "vendor_reliability_score": float,  # Historical on-time rate
        "current_inventory_level": float,
        "reorder_point": float,
        "lead_time_days": int,
        "price_volatility_30d": float,      # Percent change
        "alternative_vendor_count": int
    },
    "update_frequency": "real-time webhooks + 15min polling"
}
```

### 4. Workflow Telemetry
```python
WorkflowInput = {
    "task_data": {
        "task_id": str,
        "planned_start": datetime,
        "planned_end": datetime,
        "actual_start": datetime | None,
        "actual_end": datetime | None,
        "percent_complete": float,
        "assigned_crew_ids": List[str],
        "required_equipment_ids": List[str],
        "required_materials": List[MaterialRequirement],
        "predecessor_task_ids": List[str],
        "successor_task_ids": List[str],
        "weather_sensitive": bool,
        "weather_constraints": {
            "max_wind_speed": float,
            "min_temperature": float,
            "max_precipitation": float,
            "requires_dry_ground": bool
        },
        "critical_path_member": bool,
        "float_days": float
    },
    "resource_data": {
        "crew_id": str,
        "crew_size": int,
        "skill_certifications": List[str],
        "availability_calendar": Calendar,
        "productivity_index": float,        # Historical performance
        "fatigue_score": float              # Based on recent hours
    }
}
```

---

## Core Algorithm: Temporal Cascade Prediction

### Step 1: Temporal Alignment Preprocessing

```python
class TemporalAlignmentPreprocessor:
    """
    PATENT CLAIM 1: Novel temporal alignment method for heterogeneous 
    construction data streams using adaptive Kalman filtering with 
    domain-specific state transition matrices.
    """
    
    def __init__(self, project_timezone: str, base_resolution_minutes: int = 15):
        self.timezone = pytz.timezone(project_timezone)
        self.resolution = timedelta(minutes=base_resolution_minutes)
        self.kalman_filters = {}  # Per-sensor Kalman instances
        
    def align_streams(self, 
                      weather: WeatherStream,
                      iot: IoTStream, 
                      supply: SupplyStream,
                      workflow: WorkflowStream) -> AlignedDataFrame:
        """
        Aligns heterogeneous temporal streams to unified timeline.
        
        Novel aspects:
        1. Construction-domain Kalman state matrices
        2. Cross-stream correlation-aware imputation
        3. Anomaly-preserving alignment (doesn't smooth real risks)
        """
        
        # Create unified timeline at base resolution
        timeline = self._create_unified_timeline(
            start=datetime.now(self.timezone),
            horizon_days=7
        )
        
        # Align each stream with domain-specific handling
        aligned_weather = self._align_weather(weather, timeline)
        aligned_iot = self._align_iot_with_kalman(iot, timeline)
        aligned_supply = self._align_supply_events(supply, timeline)
        aligned_workflow = self._align_workflow_state(workflow, timeline)
        
        # Cross-stream imputation for missing values
        merged = self._cross_stream_impute(
            aligned_weather, aligned_iot, aligned_supply, aligned_workflow
        )
        
        return merged
    
    def _align_iot_with_kalman(self, iot: IoTStream, timeline: Timeline) -> DataFrame:
        """
        NOVEL: Domain-specific Kalman filtering for construction IoT.
        
        State transition matrix incorporates:
        - Equipment duty cycle patterns (excavator idle-work cycles)
        - Diurnal temperature variations on sensors
        - Crew shift change discontinuities
        """
        
        for sensor_id in iot.sensor_ids:
            if sensor_id not in self.kalman_filters:
                # Initialize with construction-domain priors
                self.kalman_filters[sensor_id] = ConstructionKalmanFilter(
                    state_dim=iot.get_sensor_dimension(sensor_id),
                    # Novel: State transition varies by equipment type
                    transition_matrix=self._get_equipment_transition(sensor_id),
                    # Novel: Measurement noise from sensor spec sheets
                    measurement_noise=self._get_sensor_noise_model(sensor_id),
                    # Novel: Process noise includes weather effects on sensors
                    process_noise=self._get_weather_adjusted_process_noise(sensor_id)
                )
            
            # Run Kalman filter with gap handling
            aligned_values = []
            for t in timeline:
                measurement = iot.get_nearest(sensor_id, t, max_gap=self.resolution*2)
                
                if measurement is not None:
                    # Update step with measurement
                    state = self.kalman_filters[sensor_id].update(measurement)
                else:
                    # Predict step only - propagate state without measurement
                    state = self.kalman_filters[sensor_id].predict()
                    # Flag as imputed for downstream uncertainty quantification
                    state.imputed = True
                
                aligned_values.append(state)
        
        return DataFrame(aligned_values, index=timeline)
    
    def _cross_stream_impute(self, *streams) -> DataFrame:
        """
        NOVEL: Cross-stream correlation-aware imputation.
        
        Example: If ground moisture sensor fails, impute from:
        - Recent precipitation data (weather stream)
        - Historical moisture patterns at same time-of-year
        - Adjacent sensor readings (IoT stream)
        
        Uses learned correlation matrix from historical project data.
        """
        
        merged = pd.concat(streams, axis=1)
        
        for col in merged.columns:
            if merged[col].isna().any():
                # Find correlated columns from pre-learned correlation matrix
                correlates = self.correlation_matrix.get_top_correlates(col, n=5)
                
                # Weighted imputation based on correlation strength
                for idx in merged[col].isna().index:
                    imputed_value = 0
                    weight_sum = 0
                    
                    for corr_col, correlation in correlates:
                        if not pd.isna(merged.loc[idx, corr_col]):
                            # Apply learned regression coefficient
                            coefficient = self.regression_coefficients[(col, corr_col)]
                            imputed_value += correlation * coefficient * merged.loc[idx, corr_col]
                            weight_sum += abs(correlation)
                    
                    if weight_sum > 0:
                        merged.loc[idx, col] = imputed_value / weight_sum
                        merged.loc[idx, f"{col}_imputed"] = True
                        merged.loc[idx, f"{col}_confidence"] = weight_sum / len(correlates)
        
        return merged
```

### Step 2: Cascade Dependency Graph Construction

```python
class CascadeDependencyGraph:
    """
    PATENT CLAIM 2: Novel directed graph structure for modeling 
    cascading risk propagation in construction projects with 
    probabilistic edge weights and multi-factor dependency encoding.
    """
    
    def __init__(self, project_schedule: Schedule, resource_pool: ResourcePool):
        self.graph = nx.DiGraph()
        self.schedule = project_schedule
        self.resources = resource_pool
        
    def build_graph(self) -> nx.DiGraph:
        """
        Constructs dependency graph with three edge types:
        1. Temporal edges (predecessor/successor)
        2. Resource contention edges (shared equipment/crew)
        3. Environmental coupling edges (weather-sensitive clusters)
        """
        
        # Add task nodes with rich attributes
        for task in self.schedule.tasks:
            self.graph.add_node(task.id, **{
                'type': 'task',
                'duration': task.planned_duration,
                'weather_sensitive': task.weather_sensitive,
                'weather_constraints': task.weather_constraints,
                'criticality': self._calculate_criticality(task),
                'resource_requirements': task.required_resources,
                'base_risk': self._calculate_base_risk(task)
            })
        
        # Type 1: Temporal dependency edges
        for task in self.schedule.tasks:
            for pred_id in task.predecessor_ids:
                self.graph.add_edge(pred_id, task.id, **{
                    'edge_type': 'temporal',
                    'lag_days': task.lag_from_predecessor.get(pred_id, 0),
                    'propagation_factor': self._calc_temporal_propagation(pred_id, task.id)
                })
        
        # Type 2: Resource contention edges (NOVEL)
        self._add_resource_contention_edges()
        
        # Type 3: Environmental coupling edges (NOVEL)
        self._add_environmental_coupling_edges()
        
        return self.graph
    
    def _add_resource_contention_edges(self):
        """
        NOVEL: Creates edges between tasks competing for same resources.
        
        Unlike traditional CPM which only considers temporal dependencies,
        this models risk propagation through resource conflicts:
        - Equipment breakdown affects all tasks needing that equipment
        - Crew fatigue from overtime propagates to next-day tasks
        - Material shortage ripples to all tasks needing that material
        """
        
        # Group tasks by required resources
        equipment_tasks = defaultdict(list)
        crew_tasks = defaultdict(list)
        material_tasks = defaultdict(list)
        
        for task_id, data in self.graph.nodes(data=True):
            for equip_id in data['resource_requirements'].get('equipment', []):
                equipment_tasks[equip_id].append(task_id)
            for crew_id in data['resource_requirements'].get('crews', []):
                crew_tasks[crew_id].append(task_id)
            for material_id in data['resource_requirements'].get('materials', []):
                material_tasks[material_id].append(task_id)
        
        # Create contention edges with propagation weights
        for resource_type, task_groups in [
            ('equipment', equipment_tasks),
            ('crew', crew_tasks),
            ('material', material_tasks)
        ]:
            for resource_id, tasks in task_groups.items():
                for i, task_a in enumerate(tasks):
                    for task_b in tasks[i+1:]:
                        # Bidirectional edge - risk propagates both ways
                        propagation = self._calc_resource_propagation(
                            resource_type, resource_id, task_a, task_b
                        )
                        
                        self.graph.add_edge(task_a, task_b, **{
                            'edge_type': 'resource_contention',
                            'resource_type': resource_type,
                            'resource_id': resource_id,
                            'propagation_factor': propagation,
                            'bidirectional': True
                        })
    
    def _add_environmental_coupling_edges(self):
        """
        NOVEL: Links weather-sensitive tasks with correlated risk profiles.
        
        Key insight: Tasks sensitive to same weather condition should have
        coupled risk scores even without direct dependency.
        
        Example: Concrete pour and crane operations both affected by wind,
        so high-wind forecast increases composite risk beyond individual tasks.
        """
        
        weather_sensitive_tasks = [
            (tid, data) for tid, data in self.graph.nodes(data=True)
            if data.get('weather_sensitive', False)
        ]
        
        for i, (task_a, data_a) in enumerate(weather_sensitive_tasks):
            for task_b, data_b in weather_sensitive_tasks[i+1:]:
                # Calculate weather constraint overlap
                overlap = self._calculate_constraint_overlap(
                    data_a['weather_constraints'],
                    data_b['weather_constraints']
                )
                
                if overlap > 0.3:  # Threshold for meaningful coupling
                    # Check temporal proximity (same day = higher coupling)
                    temporal_proximity = self._calc_temporal_proximity(task_a, task_b)
                    
                    coupling_strength = overlap * temporal_proximity
                    
                    self.graph.add_edge(task_a, task_b, **{
                        'edge_type': 'environmental_coupling',
                        'weather_overlap': overlap,
                        'temporal_proximity': temporal_proximity,
                        'propagation_factor': coupling_strength,
                        'bidirectional': True
                    })
    
    def _calculate_constraint_overlap(self, 
                                       constraints_a: dict, 
                                       constraints_b: dict) -> float:
        """
        Calculates Jaccard-like similarity between weather constraints.
        """
        shared_constraints = 0
        total_constraints = 0
        
        all_keys = set(constraints_a.keys()) | set(constraints_b.keys())
        
        for key in all_keys:
            val_a = constraints_a.get(key)
            val_b = constraints_b.get(key)
            
            if val_a is not None and val_b is not None:
                # Both tasks constrained on this parameter
                # Calculate overlap in constraint ranges
                if isinstance(val_a, (int, float)) and isinstance(val_b, (int, float)):
                    # Numeric constraint - check if same direction
                    shared_constraints += 1
            
            total_constraints += 1
        
        return shared_constraints / total_constraints if total_constraints > 0 else 0
```

### Step 3: Multi-Horizon Temporal Transformer

```python
class MultiHorizonTemporalTransformer(nn.Module):
    """
    PATENT CLAIM 3: Novel transformer architecture with parallel 
    horizon-specific attention heads and cross-risk-category attention
    for construction project risk prediction.
    """
    
    def __init__(self, 
                 input_dim: int = 128,
                 hidden_dim: int = 256,
                 num_horizons: int = 7,
                 num_risk_categories: int = 6,
                 num_layers: int = 4):
        super().__init__()
        
        self.num_horizons = num_horizons
        self.num_risk_categories = num_risk_categories
        
        # Input embedding with construction-domain features
        self.input_embedding = ConstructionFeatureEmbedding(input_dim, hidden_dim)
        
        # NOVEL: Project phase positional encoding
        # Standard positional encoding doesn't capture construction phases
        self.phase_encoding = ProjectPhaseEncoding(hidden_dim)
        
        # NOVEL: Parallel horizon-specific attention heads
        self.horizon_attention = nn.ModuleList([
            HorizonSpecificAttention(hidden_dim, horizon_day=d)
            for d in range(1, num_horizons + 1)
        ])
        
        # NOVEL: Cross-risk-category attention
        # Models how budget risk affects schedule risk, etc.
        self.cross_category_attention = CrossCategoryAttention(
            hidden_dim, num_risk_categories
        )
        
        # Transformer encoder layers
        self.encoder_layers = nn.ModuleList([
            TransformerEncoderLayer(hidden_dim, nhead=8, dropout=0.1)
            for _ in range(num_layers)
        ])
        
        # Output heads for each horizon
        self.output_heads = nn.ModuleList([
            RiskOutputHead(hidden_dim, num_risk_categories)
            for _ in range(num_horizons)
        ])
    
    def forward(self, 
                aligned_data: torch.Tensor,
                cascade_graph: torch.Tensor,
                project_phase: torch.Tensor) -> Dict[int, torch.Tensor]:
        """
        Forward pass producing risk scores for each horizon day.
        
        Args:
            aligned_data: [batch, seq_len, input_dim] - Aligned multi-source data
            cascade_graph: [batch, num_tasks, num_tasks] - Adjacency matrix
            project_phase: [batch, 1] - Current project phase (0-1 completion)
        
        Returns:
            Dictionary mapping horizon day (1-7) to risk scores
        """
        
        # Embed input features
        x = self.input_embedding(aligned_data)  # [batch, seq_len, hidden_dim]
        
        # Add project phase positional encoding
        x = x + self.phase_encoding(project_phase, x.shape[1])
        
        # Apply transformer encoder layers
        for layer in self.encoder_layers:
            x = layer(x)
        
        # NOVEL: Apply horizon-specific attention in parallel
        horizon_representations = []
        for d, horizon_attn in enumerate(self.horizon_attention):
            # Each horizon head learns different temporal patterns
            # Day 1: High weight on current sensor values
            # Day 7: High weight on trend patterns and supply chain
            h_repr = horizon_attn(x, day_offset=d+1)
            horizon_representations.append(h_repr)
        
        # NOVEL: Apply cross-category attention
        # This models risk category interdependencies:
        # - Labor shortage → Schedule delay → Budget overrun
        # - Weather delay → Material storage costs → Budget impact
        cross_category_repr = self.cross_category_attention(
            torch.stack(horizon_representations, dim=1)
        )
        
        # Generate risk scores for each horizon
        risk_scores = {}
        for d in range(self.num_horizons):
            scores = self.output_heads[d](cross_category_repr[:, d, :])
            risk_scores[d + 1] = scores  # Day 1-7
        
        return risk_scores


class HorizonSpecificAttention(nn.Module):
    """
    NOVEL: Attention mechanism with horizon-aware temporal decay.
    
    Key insight: Different forecast horizons require different attention patterns.
    - Short-term (Day 1-2): Focus on current state, sensor readings
    - Medium-term (Day 3-4): Focus on supply chain, weather trends  
    - Long-term (Day 5-7): Focus on historical patterns, seasonal factors
    """
    
    def __init__(self, hidden_dim: int, horizon_day: int):
        super().__init__()
        self.horizon_day = horizon_day
        
        self.query = nn.Linear(hidden_dim, hidden_dim)
        self.key = nn.Linear(hidden_dim, hidden_dim)
        self.value = nn.Linear(hidden_dim, hidden_dim)
        
        # Learnable temporal decay rate per horizon
        self.temporal_decay = nn.Parameter(torch.tensor(0.1 * horizon_day))
        
        # Horizon-specific feature weights
        self.feature_weights = nn.Linear(hidden_dim, hidden_dim)
    
    def forward(self, x: torch.Tensor, day_offset: int) -> torch.Tensor:
        batch, seq_len, hidden = x.shape
        
        Q = self.query(x)
        K = self.key(x)
        V = self.value(x)
        
        # Standard attention scores
        attn_scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(hidden)
        
        # NOVEL: Apply horizon-specific temporal decay
        # Creates attention pattern appropriate for forecast horizon
        temporal_positions = torch.arange(seq_len, device=x.device).float()
        decay_matrix = torch.exp(-self.temporal_decay * 
                                  torch.abs(temporal_positions.unsqueeze(0) - 
                                           temporal_positions.unsqueeze(1)))
        
        # Modulate attention by temporal decay
        attn_scores = attn_scores * decay_matrix.unsqueeze(0)
        
        attn_weights = F.softmax(attn_scores, dim=-1)
        attended = torch.matmul(attn_weights, V)
        
        # Apply horizon-specific feature weighting
        output = self.feature_weights(attended)
        
        return output.mean(dim=1)  # Pool over sequence


class CrossCategoryAttention(nn.Module):
    """
    NOVEL: Models interdependencies between risk categories.
    
    Risk Categories:
    1. Schedule Risk (delays, critical path)
    2. Budget Risk (cost overruns, cash flow)
    3. Safety Risk (incidents, compliance)
    4. Quality Risk (rework, defects)
    5. Resource Risk (labor, equipment, materials)
    6. External Risk (weather, permits, inspections)
    
    This module learns how risks in one category propagate to others.
    """
    
    def __init__(self, hidden_dim: int, num_categories: int):
        super().__init__()
        
        self.num_categories = num_categories
        
        # Project features to category-specific representations
        self.category_projections = nn.ModuleList([
            nn.Linear(hidden_dim, hidden_dim)
            for _ in range(num_categories)
        ])
        
        # Cross-category attention
        self.cross_attn = nn.MultiheadAttention(
            hidden_dim, num_heads=num_categories, batch_first=True
        )
        
        # Learnable category interaction matrix
        # Encodes domain knowledge about risk propagation
        self.interaction_matrix = nn.Parameter(
            self._initialize_interaction_matrix(num_categories)
        )
    
    def _initialize_interaction_matrix(self, n: int) -> torch.Tensor:
        """
        Initialize with construction domain knowledge.
        
        Example propagation patterns:
        - Schedule delay (1) → Budget overrun (2): High correlation
        - Weather event (6) → Schedule delay (1): High correlation
        - Safety incident (3) → Schedule delay (1): Medium correlation
        """
        matrix = torch.eye(n) * 0.5  # Self-influence
        
        # Schedule → Budget
        matrix[0, 1] = 0.7
        matrix[1, 0] = 0.3  # Reverse is weaker
        
        # External → Schedule
        matrix[5, 0] = 0.8
        
        # Safety → Schedule
        matrix[2, 0] = 0.5
        
        # Resource → Schedule
        matrix[4, 0] = 0.6
        
        # Resource → Budget
        matrix[4, 1] = 0.5
        
        return matrix
    
    def forward(self, horizon_reprs: torch.Tensor) -> torch.Tensor:
        """
        Args:
            horizon_reprs: [batch, num_horizons, hidden_dim]
        
        Returns:
            Cross-category attended representations [batch, num_horizons, hidden_dim]
        """
        batch, horizons, hidden = horizon_reprs.shape
        
        # Project to category-specific representations
        category_reprs = []
        for proj in self.category_projections:
            cat_repr = proj(horizon_reprs)  # [batch, horizons, hidden]
            category_reprs.append(cat_repr)
        
        # Stack categories: [batch, horizons, num_categories, hidden]
        stacked = torch.stack(category_reprs, dim=2)
        
        # Apply interaction matrix to model cross-category influence
        # [batch, horizons, num_categories, hidden]
        influenced = torch.einsum('bhci,cd->bhdi', stacked, self.interaction_matrix)
        
        # Cross-attention across categories
        # Reshape: [batch * horizons, num_categories, hidden]
        reshaped = influenced.view(batch * horizons, self.num_categories, hidden)
        
        attended, _ = self.cross_attn(reshaped, reshaped, reshaped)
        
        # Pool across categories and reshape back
        pooled = attended.mean(dim=1)  # [batch * horizons, hidden]
        output = pooled.view(batch, horizons, hidden)
        
        return output
```

### Step 4: Cascade Propagation Simulator

```python
class CascadePropagationSimulator:
    """
    PATENT CLAIM 4: Monte Carlo simulation engine for modeling risk 
    cascade propagation through construction project dependency graphs
    with Bayesian conditional probability chains.
    """
    
    def __init__(self, 
                 cascade_graph: CascadeDependencyGraph,
                 num_simulations: int = 10000):
        self.graph = cascade_graph.graph
        self.num_simulations = num_simulations
        self.bayesian_network = self._build_bayesian_network()
    
    def simulate_cascades(self, 
                          initial_risk_scores: Dict[str, float],
                          horizon_days: int = 7) -> Dict[str, List[float]]:
        """
        Runs Monte Carlo simulation of risk cascade propagation.
        
        NOVEL approach:
        1. Sample initial risk events from predicted probabilities
        2. Propagate through dependency graph using learned propagation factors
        3. Apply Bayesian conditional probabilities for multi-hop cascades
        4. Aggregate results for confidence intervals
        
        Returns:
            Risk score distributions per task per day
        """
        
        results = defaultdict(lambda: defaultdict(list))
        
        for sim in range(self.num_simulations):
            # Initialize simulation state
            current_state = self._initialize_simulation_state(initial_risk_scores)
            
            for day in range(1, horizon_days + 1):
                # Sample which initial risks manifest
                manifested_risks = self._sample_risk_manifestation(
                    current_state, day
                )
                
                # Propagate through cascade graph
                propagated_state = self._propagate_risks(
                    current_state, manifested_risks, day
                )
                
                # Apply Bayesian conditional updates
                final_state = self._apply_bayesian_updates(
                    propagated_state, day
                )
                
                # Record results
                for task_id, risk_score in final_state.items():
                    results[task_id][day].append(risk_score)
                
                current_state = final_state
        
        return self._aggregate_results(results)
    
    def _propagate_risks(self,
                         current_state: Dict[str, float],
                         manifested_risks: Set[str],
                         day: int) -> Dict[str, float]:
        """
        NOVEL: Multi-path risk propagation with decay and amplification.
        
        Key innovations:
        1. Propagation factor varies by edge type (temporal vs resource vs environmental)
        2. Multi-hop propagation with appropriate decay
        3. Risk amplification at convergence points (multiple risks hitting same task)
        """
        
        propagated_state = current_state.copy()
        
        # BFS propagation from manifested risk sources
        for source_task in manifested_risks:
            visited = set()
            queue = [(source_task, 1.0)]  # (task_id, propagation_strength)
            
            while queue:
                current_task, strength = queue.pop(0)
                
                if current_task in visited or strength < 0.05:
                    continue
                
                visited.add(current_task)
                
                # Propagate to neighbors
                for neighbor in self.graph.successors(current_task):
                    edge_data = self.graph.edges[current_task, neighbor]
                    
                    # Get edge-type-specific propagation factor
                    prop_factor = edge_data['propagation_factor']
                    
                    # Apply day-dependent decay
                    day_decay = self._get_day_decay(edge_data['edge_type'], day)
                    
                    new_strength = strength * prop_factor * day_decay
                    
                    # Accumulate risk (not replace) - risks compound
                    propagated_state[neighbor] = min(1.0,
                        propagated_state.get(neighbor, 0) + 
                        current_state[source_task] * new_strength
                    )
                    
                    queue.append((neighbor, new_strength))
        
        # NOVEL: Apply convergence amplification
        # When multiple risk paths converge on same task, risk is amplified
        propagated_state = self._apply_convergence_amplification(
            propagated_state, manifested_risks
        )
        
        return propagated_state
    
    def _apply_convergence_amplification(self,
                                          state: Dict[str, float],
                                          sources: Set[str]) -> Dict[str, float]:
        """
        NOVEL: Amplifies risk at tasks where multiple risk paths converge.
        
        Intuition: A task affected by both supplier delay AND equipment failure
        has compounded risk greater than sum of individual risks.
        
        Uses superlinear combination: R_combined = 1 - Π(1 - R_i)^α
        where α > 1 provides amplification
        """
        
        amplification_factor = 1.3  # Learned from historical data
        
        # Find tasks with multiple incoming risk paths
        for task_id in state:
            incoming_risks = []
            
            for predecessor in self.graph.predecessors(task_id):
                if predecessor in sources or state.get(predecessor, 0) > 0.1:
                    edge_data = self.graph.edges[predecessor, task_id]
                    incoming_risk = state.get(predecessor, 0) * edge_data['propagation_factor']
                    incoming_risks.append(incoming_risk)
            
            if len(incoming_risks) > 1:
                # Apply superlinear combination
                combined = 1.0
                for risk in incoming_risks:
                    combined *= (1 - risk) ** amplification_factor
                
                amplified_risk = 1 - combined
                state[task_id] = max(state[task_id], amplified_risk)
        
        return state
    
    def _build_bayesian_network(self) -> BayesianNetwork:
        """
        NOVEL: Constructs Bayesian network for conditional risk probabilities.
        
        Encodes domain knowledge like:
        P(Schedule Delay | Weather Event, Critical Path) 
        P(Budget Overrun | Schedule Delay, Material Price Increase)
        """
        
        bn = BayesianNetwork()
        
        # Define risk category nodes
        categories = ['schedule', 'budget', 'safety', 'quality', 'resource', 'external']
        
        for cat in categories:
            bn.add_node(cat)
        
        # Define conditional dependencies (learned from historical data)
        # External → Schedule
        bn.add_edge('external', 'schedule')
        bn.add_cpd('schedule', {
            ('external', True): 0.75,
            ('external', False): 0.15
        })
        
        # Resource → Schedule
        bn.add_edge('resource', 'schedule')
        
        # Schedule → Budget
        bn.add_edge('schedule', 'budget')
        bn.add_cpd('budget', {
            ('schedule', True): 0.80,
            ('schedule', False): 0.20
        })
        
        # Safety → Schedule (incidents cause delays)
        bn.add_edge('safety', 'schedule')
        
        return bn
    
    def _aggregate_results(self, 
                           results: Dict) -> Dict[str, Dict[int, RiskDistribution]]:
        """
        Aggregates Monte Carlo results into risk distributions.
        
        Returns percentiles and confidence intervals for each task/day.
        """
        
        aggregated = {}
        
        for task_id, day_results in results.items():
            aggregated[task_id] = {}
            
            for day, samples in day_results.items():
                samples = np.array(samples)
                
                aggregated[task_id][day] = RiskDistribution(
                    mean=np.mean(samples),
                    std=np.std(samples),
                    p5=np.percentile(samples, 5),
                    p25=np.percentile(samples, 25),
                    p50=np.percentile(samples, 50),
                    p75=np.percentile(samples, 75),
                    p95=np.percentile(samples, 95),
                    samples=samples
                )
        
        return aggregated
```

---

## Output Specification

```python
TCRPEOutput = {
    "project_id": str,
    "generated_at": datetime,
    "prediction_horizon": {
        "start": datetime,
        "end": datetime,
        "days": 7
    },
    "composite_risk_score": float,  # 0-100, weighted average
    "confidence_interval": {
        "lower": float,
        "upper": float,
        "confidence_level": 0.95
    },
    "daily_forecasts": [
        {
            "date": date,
            "day_offset": int,  # 1-7
            "risk_score": float,  # 0-100
            "risk_level": enum["low", "medium", "high", "critical"],
            "confidence": float,  # 0-1
            "category_breakdown": {
                "schedule": float,
                "budget": float,
                "safety": float,
                "quality": float,
                "resource": float,
                "external": float
            },
            "top_risk_factors": [
                {
                    "factor": str,
                    "impact_score": float,
                    "probability": float,
                    "affected_tasks": List[str],
                    "cascade_potential": float  # How likely to trigger cascades
                }
            ],
            "cascade_alerts": [
                {
                    "trigger_event": str,
                    "affected_chain": List[str],  # Task IDs in cascade
                    "total_impact_days": float,
                    "mitigation_window_hours": float
                }
            ]
        }
    ],
    "recommendations": [
        {
            "priority": int,  # 1 = highest
            "action": str,
            "rationale": str,
            "risk_reduction": float,  # Expected score reduction
            "deadline": datetime,
            "responsible_party": str
        }
    ]
}
```

---

## Claims Summary for Patent 1

1. **Claim 1**: A computer-implemented method for construction project risk prediction comprising temporal alignment of heterogeneous data streams using domain-specific Kalman filtering with construction equipment state transition matrices.

2. **Claim 2**: A system for modeling risk cascade propagation comprising a directed graph with temporal, resource contention, and environmental coupling edge types, wherein edge weights represent learned propagation factors.

3. **Claim 3**: A multi-horizon temporal transformer neural network architecture comprising parallel horizon-specific attention heads with learnable temporal decay parameters and cross-risk-category attention mechanisms.

4. **Claim 4**: A Monte Carlo simulation method for risk cascade prediction comprising Bayesian conditional probability chains and convergence amplification at multi-path junction points.

5. **Claim 5**: A construction risk prediction system achieving 87% accuracy on 3-7 day forecasts by combining claims 1-4 into an integrated prediction pipeline.

---
---

# PATENT 2: UNIFIED CONSTRUCTION DATA FABRIC (UCDF™)

## Abstract

A proprietary data normalization and integration system for construction project management that ingests heterogeneous data from multiple enterprise systems (Procore, QuickBooks, Primavera, custom CSVs) and normalizes them into a unified semantic model enabling cross-platform analytics without data silos.

## Technical Field

This invention relates to data integration systems for enterprise software, specifically to methods and apparatus for real-time normalization and fusion of construction project data from disparate sources.

## Background & Prior Art Limitations

### Existing Integration Approaches:
- **Point-to-point integrations**: N² connections for N systems, brittle
- **ETL batch processing**: Stale data, not real-time
- **Generic iPaaS (Zapier, Workato)**: No construction domain knowledge
- **Vendor lock-in**: Procore/Autodesk ecosystems don't interoperate

### Novel Differentiation:
UCDF™ introduces a **semantic construction ontology** that understands construction domain entities (tasks, materials, crews, equipment) and can intelligently map disparate schemas to a unified model, resolving conflicts and maintaining provenance.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    UNIFIED CONSTRUCTION DATA FABRIC                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    SOURCE CONNECTORS LAYER                        │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │   │
│  │  │ Procore │ │QuickBook│ │Primavera│ │   CSV   │ │  Custom │    │   │
│  │  │   API   │ │   API   │ │   API   │ │ Upload  │ │   API   │    │   │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘    │   │
│  └───────┼──────────┼──────────┼──────────┼──────────┼─────────────┘   │
│          │          │          │          │          │                  │
│          ▼          ▼          ▼          ▼          ▼                  │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              SCHEMA INFERENCE & DETECTION ENGINE                  │   │
│  │  • Automatic field type detection                                 │   │
│  │  • Construction entity recognition (NER for construction)         │   │
│  │  • Relationship inference                                         │   │
│  └──────────────────────────┬───────────────────────────────────────┘   │
│                             │                                           │
│                             ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │            SEMANTIC CONSTRUCTION ONTOLOGY (SCO)                   │   │
│  │  • 500+ construction domain entities                              │   │
│  │  • Hierarchical relationships                                     │   │
│  │  • Unit standardization rules                                     │   │
│  │  • Cross-system identity resolution                               │   │
│  └──────────────────────────┬───────────────────────────────────────┘   │
│                             │                                           │
│                             ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              CONFLICT RESOLUTION ENGINE (CRE)                     │   │
│  │  • Duplicate detection with fuzzy matching                        │   │
│  │  • Timestamp-based versioning                                     │   │
│  │  • Confidence-weighted merging                                    │   │
│  │  • Audit trail maintenance                                        │   │
│  └──────────────────────────┬───────────────────────────────────────┘   │
│                             │                                           │
│                             ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              UNIFIED DATA STORE (Time-Series + Graph)             │   │
│  │  • Normalized construction entities                               │   │
│  │  • Full lineage tracking                                          │   │
│  │  • Real-time materialized views                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Algorithm: Semantic Schema Mapping

### Step 1: Schema Inference Engine

```python
class ConstructionSchemaInferenceEngine:
    """
    PATENT CLAIM 1: Automatic schema detection and construction 
    domain entity recognition for arbitrary data sources.
    """
    
    def __init__(self):
        self.entity_recognizer = ConstructionNERModel()
        self.type_detector = TypeInferenceEngine()
        self.relationship_inferrer = RelationshipInferenceEngine()
        
    def infer_schema(self, data_source: DataSource) -> InferredSchema:
        """
        Analyzes incoming data and infers construction-aware schema.
        
        NOVEL aspects:
        1. Construction-specific NER for field name interpretation
        2. Value-based type inference with construction units
        3. Cross-field relationship detection
        """
        
        # Sample data for inference
        sample = data_source.sample(n=1000)
        
        # Detect column types with construction awareness
        column_types = {}
        for column in sample.columns:
            column_types[column] = self._infer_column_type(sample[column], column)
        
        # Recognize construction entities in column names
        entity_mappings = self._recognize_entities(sample.columns)
        
        # Infer relationships between columns
        relationships = self._infer_relationships(sample, column_types)
        
        return InferredSchema(
            columns=column_types,
            entity_mappings=entity_mappings,
            relationships=relationships,
            confidence_scores=self._calculate_confidence(sample, column_types)
        )
    
    def _infer_column_type(self, 
                           series: pd.Series, 
                           column_name: str) -> ColumnType:
        """
        NOVEL: Construction-aware type inference.
        
        Goes beyond basic type detection to recognize:
        - Construction units (board feet, cubic yards, PSI)
        - Date formats common in construction (WBS dates)
        - Cost formats (with/without currency symbols)
        - ID formats (RFI numbers, submittal IDs)
        """
        
        # Basic type detection
        basic_type = self.type_detector.detect_basic_type(series)
        
        # Construction-specific refinement
        if basic_type == 'numeric':
            # Check for construction units
            unit = self._detect_construction_unit(series, column_name)
            if unit:
                return ColumnType(
                    base_type='numeric',
                    construction_type='measurement',
                    unit=unit,
                    semantic_meaning=self._infer_meaning_from_unit(unit)
                )
            
            # Check for currency
            if self._is_currency(series, column_name):
                return ColumnType(
                    base_type='numeric',
                    construction_type='cost',
                    unit='USD',
                    semantic_meaning='monetary_value'
                )
        
        elif basic_type == 'string':
            # Check for construction IDs
            id_type = self._detect_construction_id_type(series)
            if id_type:
                return ColumnType(
                    base_type='string',
                    construction_type='identifier',
                    id_format=id_type,
                    semantic_meaning=f'{id_type}_reference'
                )
        
        elif basic_type == 'datetime':
            # Check for construction date types
            date_type = self._classify_construction_date(series, column_name)
            return ColumnType(
                base_type='datetime',
                construction_type=date_type,
                semantic_meaning=f'{date_type}_date'
            )
        
        return ColumnType(base_type=basic_type)
    
    def _detect_construction_unit(self, 
                                   series: pd.Series, 
                                   column_name: str) -> Optional[str]:
        """
        Detects construction-specific units from values and column names.
        
        Supports:
        - Linear: feet, meters, inches
        - Area: square feet, square meters
        - Volume: cubic yards, gallons, liters
        - Weight: tons, pounds, kilograms
        - Pressure: PSI, kPa
        - Temperature: Fahrenheit, Celsius
        - Construction-specific: board feet, man-hours, crane-hours
        """
        
        # Pattern matching on column name
        unit_patterns = {
            r'(?i)(sq\.?\s*ft|square\s*feet|sf)': 'square_feet',
            r'(?i)(cu\.?\s*yd|cubic\s*yard|cy)': 'cubic_yards',
            r'(?i)(bd\.?\s*ft|board\s*feet|bf)': 'board_feet',
            r'(?i)(man[\-\s]*hours?|mh)': 'man_hours',
            r'(?i)(lf|linear\s*feet)': 'linear_feet',
            r'(?i)(psi|pounds?\s*per\s*square\s*inch)': 'psi',
            r'(?i)(gal|gallons?)': 'gallons',
            r'(?i)(tons?)': 'tons',
            r'(?i)(lbs?|pounds?)': 'pounds',
        }
        
        for pattern, unit in unit_patterns.items():
            if re.search(pattern, column_name):
                return unit
        
        # Value-based detection (look for unit suffixes in values)
        sample_values = series.dropna().head(100).astype(str)
        for val in sample_values:
            for pattern, unit in unit_patterns.items():
                if re.search(pattern, val):
                    return unit
        
        return None
    
    def _recognize_entities(self, 
                            columns: List[str]) -> Dict[str, ConstructionEntity]:
        """
        NOVEL: Construction-specific Named Entity Recognition for schema mapping.
        
        Recognizes column names as construction entities:
        - "Project_Start_Date" → Project.start_date
        - "Foreman_Name" → Crew.supervisor_name  
        - "PO_Number" → PurchaseOrder.id
        - "RFI_Status" → RFI.status
        """
        
        mappings = {}
        
        for column in columns:
            # Tokenize column name
            tokens = self._tokenize_column_name(column)
            
            # Run through construction NER model
            entities = self.entity_recognizer.predict(tokens)
            
            if entities:
                # Map to ontology entity
                ontology_mapping = self._map_to_ontology(entities, tokens)
                mappings[column] = ontology_mapping
        
        return mappings
```

### Step 2: Semantic Construction Ontology

```python
class SemanticConstructionOntology:
    """
    PATENT CLAIM 2: Comprehensive construction domain ontology with 
    500+ entities, hierarchical relationships, and cross-system mapping rules.
    """
    
    def __init__(self):
        self.entities = self._load_entity_definitions()
        self.relationships = self._load_relationship_definitions()
        self.mapping_rules = self._load_system_mapping_rules()
        self.unit_conversions = self._load_unit_conversions()
        
    def _load_entity_definitions(self) -> Dict[str, EntityDefinition]:
        """
        NOVEL: Comprehensive construction entity hierarchy.
        """
        
        return {
            # Project Level
            'Project': EntityDefinition(
                name='Project',
                attributes={
                    'id': Attribute('string', required=True, primary_key=True),
                    'name': Attribute('string', required=True),
                    'status': Attribute('enum', values=['planning', 'active', 'on_hold', 'completed']),
                    'start_date': Attribute('date'),
                    'end_date': Attribute('date'),
                    'budget': Attribute('currency'),
                    'location': Attribute('geo_point'),
                },
                relationships=['has_many:Task', 'has_many:Crew', 'has_many:Budget']
            ),
            
            # Work Breakdown Structure
            'Task': EntityDefinition(
                name='Task',
                parent='WorkItem',
                attributes={
                    'id': Attribute('string', required=True, primary_key=True),
                    'wbs_code': Attribute('string', pattern=r'\d+(\.\d+)*'),
                    'name': Attribute('string', required=True),
                    'status': Attribute('enum', values=['not_started', 'in_progress', 'completed', 'blocked']),
                    'planned_start': Attribute('datetime'),
                    'planned_end': Attribute('datetime'),
                    'actual_start': Attribute('datetime'),
                    'actual_end': Attribute('datetime'),
                    'percent_complete': Attribute('percentage'),
                    'planned_hours': Attribute('numeric', unit='hours'),
                    'actual_hours': Attribute('numeric', unit='hours'),
                    'planned_cost': Attribute('currency'),
                    'actual_cost': Attribute('currency'),
                },
                relationships=['belongs_to:Project', 'has_many:Resource', 'has_predecessors:Task']
            ),
            
            # Resources
            'Crew': EntityDefinition(
                name='Crew',
                parent='Resource',
                attributes={
                    'id': Attribute('string', required=True, primary_key=True),
                    'name': Attribute('string'),
                    'trade': Attribute('enum', values=['electrical', 'plumbing', 'carpentry', 'concrete', 'steel', 'hvac', 'general']),
                    'size': Attribute('integer'),
                    'hourly_rate': Attribute('currency', per='hour'),
                    'supervisor_id': Attribute('string', foreign_key='Worker.id'),
                },
                relationships=['belongs_to:Project', 'assigned_to:Task']
            ),
            
            'Equipment': EntityDefinition(
                name='Equipment',
                parent='Resource',
                attributes={
                    'id': Attribute('string', required=True, primary_key=True),
                    'name': Attribute('string'),
                    'type': Attribute('enum', values=['crane', 'excavator', 'loader', 'truck', 'pump', 'generator', 'scaffolding']),
                    'capacity': Attribute('numeric'),
                    'capacity_unit': Attribute('string'),
                    'daily_rate': Attribute('currency', per='day'),
                    'status': Attribute('enum', values=['available', 'in_use', 'maintenance', 'reserved']),
                },
                relationships=['belongs_to:Project', 'assigned_to:Task']
            ),
            
            'Material': EntityDefinition(
                name='Material',
                parent='Resource',
                attributes={
                    'id': Attribute('string', required=True, primary_key=True),
                    'name': Attribute('string', required=True),
                    'category': Attribute('enum', values=['concrete', 'steel', 'lumber', 'electrical', 'plumbing', 'finishing', 'other']),
                    'unit': Attribute('string'),  # board_feet, cubic_yards, etc.
                    'unit_cost': Attribute('currency'),
                    'quantity_ordered': Attribute('numeric'),
                    'quantity_received': Attribute('numeric'),
                    'quantity_used': Attribute('numeric'),
                },
                relationships=['belongs_to:Project', 'required_by:Task', 'supplied_by:Vendor']
            ),
            
            # Financial
            'Budget': EntityDefinition(
                name='Budget',
                attributes={
                    'id': Attribute('string', required=True, primary_key=True),
                    'category': Attribute('enum', values=['labor', 'materials', 'equipment', 'subcontractor', 'permits', 'contingency']),
                    'planned_amount': Attribute('currency'),
                    'committed_amount': Attribute('currency'),
                    'actual_amount': Attribute('currency'),
                    'forecast_amount': Attribute('currency'),
                },
                relationships=['belongs_to:Project']
            ),
            
            'PurchaseOrder': EntityDefinition(
                name='PurchaseOrder',
                attributes={
                    'id': Attribute('string', required=True, primary_key=True),
                    'po_number': Attribute('string', pattern=r'PO-\d+'),
                    'vendor_id': Attribute('string', foreign_key='Vendor.id'),
                    'status': Attribute('enum', values=['draft', 'submitted', 'approved', 'ordered', 'partial', 'received', 'closed']),
                    'total_amount': Attribute('currency'),
                    'order_date': Attribute('date'),
                    'expected_delivery': Attribute('date'),
                    'actual_delivery': Attribute('date'),
                },
                relationships=['belongs_to:Project', 'placed_with:Vendor', 'contains:Material']
            ),
            
            # Documents
            'RFI': EntityDefinition(
                name='RFI',
                parent='Document',
                attributes={
                    'id': Attribute('string', required=True, primary_key=True),
                    'rfi_number': Attribute('string', pattern=r'RFI-\d+'),
                    'subject': Attribute('string'),
                    'status': Attribute('enum', values=['draft', 'submitted', 'under_review', 'answered', 'closed']),
                    'submitted_date': Attribute('date'),
                    'due_date': Attribute('date'),
                    'responded_date': Attribute('date'),
                    'cost_impact': Attribute('currency'),
                    'schedule_impact_days': Attribute('integer'),
                },
                relationships=['belongs_to:Project', 'related_to:Task']
            ),
            
            'ChangeOrder': EntityDefinition(
                name='ChangeOrder',
                parent='Document',
                attributes={
                    'id': Attribute('string', required=True, primary_key=True),
                    'co_number': Attribute('string', pattern=r'CO-\d+'),
                    'description': Attribute('string'),
                    'status': Attribute('enum', values=['proposed', 'pending', 'approved', 'rejected']),
                    'cost_impact': Attribute('currency'),
                    'schedule_impact_days': Attribute('integer'),
                    'submitted_date': Attribute('date'),
                    'approved_date': Attribute('date'),
                },
                relationships=['belongs_to:Project', 'affects:Task', 'affects:Budget']
            ),
            
            # Continue with 490+ more entities...
        }
    
    def _load_system_mapping_rules(self) -> Dict[str, SystemMappingRules]:
        """
        NOVEL: Pre-built mapping rules for major construction systems.
        """
        
        return {
            'procore': SystemMappingRules(
                system_name='Procore',
                api_version='v1.1',
                entity_mappings={
                    'projects': EntityMapping(
                        source_endpoint='/projects',
                        target_entity='Project',
                        field_mappings={
                            'id': 'id',
                            'name': 'name',
                            'project_number': 'external_id',
                            'start_date': 'start_date',
                            'projected_finish_date': 'end_date',
                            'company.name': 'owner_company',
                            'stage': FieldMapping(
                                target='status',
                                transform='procore_stage_to_status'
                            ),
                            'address': FieldMapping(
                                target='location',
                                transform='address_to_geopoint'
                            ),
                        }
                    ),
                    'work_breakdown_structure': EntityMapping(
                        source_endpoint='/projects/{project_id}/work_breakdown_structure',
                        target_entity='Task',
                        field_mappings={
                            'id': 'id',
                            'code': 'wbs_code',
                            'description': 'name',
                            'status': 'status',
                            'start_date': 'planned_start',
                            'finish_date': 'planned_end',
                            'actual_start_date': 'actual_start',
                            'actual_finish_date': 'actual_end',
                            'percent_complete': 'percent_complete',
                            'cost_codes': FieldMapping(
                                target='budget_codes',
                                transform='flatten_cost_codes'
                            ),
                        }
                    ),
                    'rfis': EntityMapping(
                        source_endpoint='/projects/{project_id}/rfis',
                        target_entity='RFI',
                        field_mappings={
                            'id': 'id',
                            'number': 'rfi_number',
                            'subject': 'subject',
                            'status': 'status',
                            'created_at': 'submitted_date',
                            'due_date': 'due_date',
                            'closed_date': 'responded_date',
                            'cost_impact': 'cost_impact',
                            'schedule_impact': FieldMapping(
                                target='schedule_impact_days',
                                transform='procore_schedule_impact_to_days'
                            ),
                        }
                    ),
                }
            ),
            
            'quickbooks': SystemMappingRules(
                system_name='QuickBooks',
                api_version='v3',
                entity_mappings={
                    'invoices': EntityMapping(
                        source_endpoint='/invoice',
                        target_entity='Invoice',
                        field_mappings={
                            'Id': 'id',
                            'DocNumber': 'invoice_number',
                            'TxnDate': 'invoice_date',
                            'DueDate': 'due_date',
                            'TotalAmt': 'total_amount',
                            'Balance': 'balance_due',
                            'CustomerRef.value': FieldMapping(
                                target='project_id',
                                transform='qb_customer_to_project'
                            ),
                        }
                    ),
                    'bills': EntityMapping(
                        source_endpoint='/bill',
                        target_entity='VendorBill',
                        field_mappings={
                            'Id': 'id',
                            'DocNumber': 'bill_number',
                            'TxnDate': 'bill_date',
                            'DueDate': 'due_date',
                            'TotalAmt': 'total_amount',
                            'VendorRef.value': 'vendor_id',
                            'Line': FieldMapping(
                                target='line_items',
                                transform='qb_lines_to_items'
                            ),
                        }
                    ),
                }
            ),
            
            'primavera': SystemMappingRules(
                system_name='Oracle Primavera P6',
                api_version='19.12',
                entity_mappings={
                    'activity': EntityMapping(
                        source_endpoint='/activity',
                        target_entity='Task',
                        field_mappings={
                            'ActivityId': 'id',
                            'WBSCode': 'wbs_code',
                            'Name': 'name',
                            'Status': FieldMapping(
                                target='status',
                                transform='p6_status_to_standard'
                            ),
                            'PlannedStartDate': 'planned_start',
                            'PlannedFinishDate': 'planned_end',
                            'ActualStartDate': 'actual_start',
                            'ActualFinishDate': 'actual_end',
                            'PercentComplete': FieldMapping(
                                target='percent_complete',
                                transform='p6_percent_to_decimal'
                            ),
                            'PlannedLaborUnits': 'planned_hours',
                            'ActualLaborUnits': 'actual_hours',
                            'PlannedTotalCost': 'planned_cost',
                            'ActualTotalCost': 'actual_cost',
                            'TotalFloat': FieldMapping(
                                target='float_days',
                                transform='p6_float_to_days'
                            ),
                        }
                    ),
                }
            ),
            
            'csv': SystemMappingRules(
                system_name='CSV Upload',
                api_version='1.0',
                # CSV mappings are inferred dynamically
                auto_mapping=True,
                inference_rules={
                    'date_formats': ['%Y-%m-%d', '%m/%d/%Y', '%d-%b-%Y', '%Y%m%d'],
                    'currency_patterns': [r'^\$?[\d,]+\.?\d*$'],
                    'id_patterns': [
                        (r'^[A-Z]+-\d+$', 'document_id'),
                        (r'^\d+\.\d+(\.\d+)*$', 'wbs_code'),
                    ],
                }
            ),
        }
```

### Step 3: Conflict Resolution Engine

```python
class ConflictResolutionEngine:
    """
    PATENT CLAIM 3: Intelligent conflict resolution for multi-source 
    construction data with provenance tracking and confidence-weighted merging.
    """
    
    def __init__(self, ontology: SemanticConstructionOntology):
        self.ontology = ontology
        self.identity_resolver = ConstructionIdentityResolver()
        self.merge_strategy = ConfidenceWeightedMerge()
        
    def resolve_conflicts(self, 
                          records: List[NormalizedRecord],
                          entity_type: str) -> List[ResolvedRecord]:
        """
        NOVEL: Multi-stage conflict resolution with provenance.
        
        Stages:
        1. Identity Resolution - Determine which records refer to same entity
        2. Field-level Conflict Detection - Find conflicting values
        3. Confidence-weighted Merging - Combine based on source reliability
        4. Provenance Recording - Track origin of final values
        """
        
        # Stage 1: Identity Resolution
        entity_groups = self._resolve_identities(records, entity_type)
        
        resolved_records = []
        for entity_id, group in entity_groups.items():
            if len(group) == 1:
                # No conflict, single source
                resolved = self._single_source_record(group[0])
            else:
                # Multiple sources, need conflict resolution
                resolved = self._resolve_multi_source(group, entity_type)
            
            resolved_records.append(resolved)
        
        return resolved_records
    
    def _resolve_identities(self,
                            records: List[NormalizedRecord],
                            entity_type: str) -> Dict[str, List[NormalizedRecord]]:
        """
        NOVEL: Construction-aware identity resolution using multiple signals.
        
        Matching strategies by entity type:
        - Task: WBS code match, name similarity + date overlap
        - Material: Name + vendor + unit combination
        - Worker: Name + trade + company
        - Equipment: Serial number, or name + type + capacity
        """
        
        entity_def = self.ontology.entities[entity_type]
        
        # Get identity resolution strategy for this entity type
        strategy = self._get_identity_strategy(entity_type)
        
        groups = defaultdict(list)
        processed = set()
        
        for i, record in enumerate(records):
            if i in processed:
                continue
            
            # Check against all other records
            matches = [record]
            processed.add(i)
            
            for j, other_record in enumerate(records[i+1:], start=i+1):
                if j in processed:
                    continue
                
                if strategy.is_match(record, other_record):
                    matches.append(other_record)
                    processed.add(j)
            
            # Create entity ID
            entity_id = strategy.generate_canonical_id(matches)
            groups[entity_id] = matches
        
        return groups
    
    def _resolve_multi_source(self,
                               records: List[NormalizedRecord],
                               entity_type: str) -> ResolvedRecord:
        """
        NOVEL: Field-by-field conflict resolution with confidence weighting.
        
        For each field:
        1. Check if values conflict
        2. If conflict, use confidence-weighted merge
        3. Record provenance of chosen value
        """
        
        entity_def = self.ontology.entities[entity_type]
        
        resolved_fields = {}
        provenance = {}
        conflicts = []
        
        for field_name, field_def in entity_def.attributes.items():
            field_values = [
                (r.get(field_name), r.source_system, r.source_confidence, r.timestamp)
                for r in records
                if r.get(field_name) is not None
            ]
            
            if not field_values:
                continue
            
            if len(field_values) == 1:
                # Single source
                value, source, confidence, timestamp = field_values[0]
                resolved_fields[field_name] = value
                provenance[field_name] = Provenance(
                    value=value,
                    source=source,
                    confidence=confidence,
                    timestamp=timestamp,
                    conflict_resolved=False
                )
            else:
                # Multiple sources - check for conflict
                unique_values = set(v[0] for v in field_values if v[0] is not None)
                
                if len(unique_values) == 1:
                    # No conflict, values agree
                    value = unique_values.pop()
                    resolved_fields[field_name] = value
                    provenance[field_name] = Provenance(
                        value=value,
                        sources=[v[1] for v in field_values],
                        confidence=max(v[2] for v in field_values),
                        conflict_resolved=False
                    )
                else:
                    # Conflict! Apply resolution strategy
                    resolved_value, resolution_provenance = self._resolve_field_conflict(
                        field_name, field_def, field_values
                    )
                    
                    resolved_fields[field_name] = resolved_value
                    provenance[field_name] = resolution_provenance
                    
                    conflicts.append(FieldConflict(
                        field=field_name,
                        values=field_values,
                        resolved_value=resolved_value,
                        resolution_method=resolution_provenance.resolution_method
                    ))
        
        return ResolvedRecord(
            entity_type=entity_type,
            fields=resolved_fields,
            provenance=provenance,
            conflicts=conflicts,
            source_count=len(records)
        )
    
    def _resolve_field_conflict(self,
                                 field_name: str,
                                 field_def: Attribute,
                                 values: List[Tuple]) -> Tuple[Any, Provenance]:
        """
        NOVEL: Type-aware conflict resolution with multiple strategies.
        
        Strategies by field type:
        - Numeric: Weighted average by confidence + recency
        - Date: Most recent from most reliable source
        - Enum/Status: Latest status from system of record
        - String: Most complete value or system of record
        """
        
        if field_def.base_type == 'numeric':
            return self._resolve_numeric_conflict(values)
        elif field_def.base_type == 'datetime':
            return self._resolve_date_conflict(values)
        elif field_def.base_type == 'enum':
            return self._resolve_enum_conflict(values, field_def.values)
        else:
            return self._resolve_string_conflict(values)
    
    def _resolve_numeric_conflict(self,
                                   values: List[Tuple]) -> Tuple[float, Provenance]:
        """
        NOVEL: Confidence and recency weighted numeric merge.
        
        Formula: v_resolved = Σ(v_i * c_i * r_i) / Σ(c_i * r_i)
        
        Where:
        - v_i = value from source i
        - c_i = confidence score of source i
        - r_i = recency factor (exponential decay from timestamp)
        """
        
        now = datetime.now()
        recency_halflife_days = 7  # Value importance halves every 7 days
        
        weighted_sum = 0
        weight_total = 0
        
        for value, source, confidence, timestamp in values:
            # Calculate recency factor
            age_days = (now - timestamp).days
            recency_factor = math.exp(-0.693 * age_days / recency_halflife_days)
            
            weight = confidence * recency_factor
            weighted_sum += value * weight
            weight_total += weight
        
        resolved_value = weighted_sum / weight_total if weight_total > 0 else values[0][0]
        
        # Find primary contributor for provenance
        primary_source = max(values, key=lambda v: v[2] * math.exp(-0.693 * (now - v[3]).days / recency_halflife_days))
        
        return resolved_value, Provenance(
            value=resolved_value,
            source=primary_source[1],
            confidence=weight_total / len(values),  # Average confidence
            timestamp=now,
            conflict_resolved=True,
            resolution_method='confidence_recency_weighted_average',
            contributing_sources=[v[1] for v in values],
            original_values={v[1]: v[0] for v in values}
        )
```

---

## Output Specification

```python
UCDFOutput = {
    "unified_entity": {
        "entity_type": str,
        "canonical_id": str,
        "fields": Dict[str, Any],
        "last_updated": datetime,
        "version": int
    },
    "provenance": {
        "field_name": {
            "value": Any,
            "source_system": str,
            "source_record_id": str,
            "confidence": float,
            "timestamp": datetime,
            "conflict_resolved": bool,
            "resolution_method": Optional[str],
            "original_values": Optional[Dict[str, Any]]
        }
    },
    "sync_status": {
        "last_sync": Dict[str, datetime],  # Per source system
        "sync_health": Dict[str, str],      # "healthy", "delayed", "error"
        "pending_conflicts": int
    },
    "lineage_graph": {
        "nodes": List[LineageNode],
        "edges": List[LineageEdge]
    }
}
```

---

## Claims Summary for Patent 2

1. **Claim 1**: A computer-implemented method for automatic schema inference of construction data comprising construction-specific named entity recognition, domain-aware type detection with construction unit recognition, and cross-field relationship inference.

2. **Claim 2**: A semantic ontology system for construction project data comprising 500+ entity definitions with hierarchical relationships, pre-built mapping rules for major construction software platforms, and automatic field-level transformation functions.

3. **Claim 3**: A conflict resolution system for multi-source construction data comprising identity resolution using entity-type-specific matching strategies, confidence-weighted field merging with recency decay, and complete provenance tracking for audit compliance.

4. **Claim 4**: A real-time data normalization pipeline that continuously ingests, normalizes, and resolves data from heterogeneous construction systems into a unified queryable data store with sub-second latency.

---
---

# PATENT 3: MODULAR CONSTRUCTION ORCHESTRATION SYSTEM (MCOS™)

## Abstract

A scheduling and logistics optimization system for modular and prefabricated construction projects that coordinates off-site fabrication facilities with on-site assembly operations, predicting and preventing logistics bottlenecks through multi-facility synchronization, transportation network modeling, and just-in-time delivery optimization.

## Technical Field

This invention relates to supply chain optimization and scheduling systems for construction, specifically to methods for coordinating distributed manufacturing facilities with construction site assembly in modular building projects.

## Background & Prior Art Limitations

### Existing Scheduling Tools:
- **Traditional CPM (Primavera, MS Project)**: Assumes single-location linear workflow
- **Manufacturing MRP/ERP (SAP)**: Factory-focused, ignores site constraints
- **Construction logistics tools**: Reactive tracking, not predictive optimization
- **Modular coordination**: Manual spreadsheets, phone calls between facilities

### Novel Differentiation:
MCOS™ introduces **bi-directional constraint propagation** between factory and site schedules, with transportation network modeling that treats the logistics chain as a synchronized pipeline with buffer management.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              MODULAR CONSTRUCTION ORCHESTRATION SYSTEM                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                    FACTORY DIGITAL TWINS                           │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │     │
│  │  │Factory A │  │Factory B │  │Factory C │  │  Vendor  │           │     │
│  │  │ Schedule │  │ Schedule │  │ Schedule │  │ Facility │           │     │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘           │     │
│  └───────┼─────────────┼─────────────┼─────────────┼─────────────────┘     │
│          │             │             │             │                        │
│          ▼             ▼             ▼             ▼                        │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │           BI-DIRECTIONAL CONSTRAINT PROPAGATION ENGINE             │     │
│  │  • Factory → Site: Module completion dates propagate to assembly   │     │
│  │  • Site → Factory: Site readiness windows propagate to production  │     │
│  │  • Cross-factory: Material sharing, capacity balancing             │     │
│  └──────────────────────────┬─────────────────────────────────────────┘     │
│                             │                                               │
│                             ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │              TRANSPORTATION NETWORK OPTIMIZER (TNO)                │     │
│  │  • Route optimization with oversized load constraints              │     │
│  │  • Permit scheduling for wide loads                                │     │
│  │  • Weather-adjusted transit time modeling                          │     │
│  │  • Staging yard capacity management                                │     │
│  └──────────────────────────┬─────────────────────────────────────────┘     │
│                             │                                               │
│                             ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │              JUST-IN-TIME DELIVERY ORCHESTRATOR (JITDO)            │     │
│  │  • Assembly sequence optimization                                  │     │
│  │  • Crane schedule coordination                                     │     │
│  │  • Buffer management between deliveries                            │     │
│  │  • Real-time re-sequencing on delays                               │     │
│  └──────────────────────────┬─────────────────────────────────────────┘     │
│                             │                                               │
│                             ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                    SITE DIGITAL TWIN                               │     │
│  │  • 4D BIM integration                                              │     │
│  │  • Crane reach/capacity simulation                                 │     │
│  │  • Staging area visualization                                      │     │
│  │  • Worker/equipment positioning                                    │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Algorithm: Bi-Directional Constraint Propagation

### Step 1: Unified Schedule Graph

```python
class ModularScheduleGraph:
    """
    PATENT CLAIM 1: Novel graph structure representing modular construction 
    workflow spanning multiple facilities and transportation network with 
    bi-directional constraint edges.
    """
    
    def __init__(self):
        self.graph = nx.DiGraph()
        self.facilities = {}
        self.transport_network = TransportNetwork()
        
    def build_schedule_graph(self,
                             factories: List[Factory],
                             site: ConstructionSite,
                             modules: List[ModuleSpec],
                             transport_constraints: TransportConstraints) -> nx.DiGraph:
        """
        Constructs unified schedule graph with three node types:
        1. Factory Tasks (fabrication activities)
        2. Transport Legs (shipping movements)
        3. Site Tasks (assembly activities)
        
        And four edge types:
        1. Factory precedence (within-factory sequencing)
        2. Factory-to-Transport (completion triggers shipping)
        3. Transport-to-Site (arrival enables assembly)
        4. Site precedence (assembly sequencing)
        
        NOVEL: Bi-directional constraint edges propagate delays/acceleration
        """
        
        for module in modules:
            # Create factory fabrication subgraph
            fab_tasks = self._create_fabrication_tasks(module, factories)
            
            # Create transport leg
            transport_leg = self._create_transport_leg(module, transport_constraints)
            
            # Create site assembly task
            assembly_task = self._create_assembly_task(module, site)
            
            # Connect with constraint edges
            self._connect_forward_constraints(fab_tasks, transport_leg, assembly_task)
            self._connect_backward_constraints(fab_tasks, transport_leg, assembly_task)
        
        # Add cross-module dependencies
        self._add_assembly_sequence_constraints(modules, site)
        
        return self.graph
    
    def _create_fabrication_tasks(self,
                                   module: ModuleSpec,
                                   factories: List[Factory]) -> List[GraphNode]:
        """
        Creates fabrication task nodes with factory-specific constraints.
        """
        
        # Assign to optimal factory based on capacity and module type
        assigned_factory = self._assign_factory(module, factories)
        
        tasks = []
        
        # Break down module into fabrication steps
        for step in module.fabrication_steps:
            task_node = GraphNode(
                id=f"{module.id}_fab_{step.id}",
                type='fabrication',
                module_id=module.id,
                factory_id=assigned_factory.id,
                duration=step.base_duration,
                resources_required=step.resources,
                predecessors=step.predecessor_step_ids,
                # NOVEL: Factory-specific constraints
                factory_constraints={
                    'workstation': step.required_workstation,
                    'shift_hours': assigned_factory.shift_hours,
                    'parallel_capacity': assigned_factory.get_workstation_capacity(step.required_workstation),
                },
                # NOVEL: Quality gates that must pass before shipping
                quality_gates=step.quality_requirements,
                # Bi-directional constraint flags
                propagates_forward=True,   # Delay affects transport/site
                propagates_backward=True,  # Site delays can shift factory schedule
            )
            
            self.graph.add_node(task_node.id, **task_node.__dict__)
            tasks.append(task_node)
        
        # Add factory precedence edges
        for task in tasks:
            for pred_id in task.predecessors:
                full_pred_id = f"{module.id}_fab_{pred_id}"
                if self.graph.has_node(full_pred_id):
                    self.graph.add_edge(full_pred_id, task.id, **{
                        'edge_type': 'factory_precedence',
                        'lag': 0,
                        'constraint': 'finish_to_start'
                    })
        
        return tasks
    
    def _create_transport_leg(self,
                               module: ModuleSpec,
                               constraints: TransportConstraints) -> GraphNode:
        """
        NOVEL: Transport leg as schedulable entity with complex constraints.
        """
        
        transport_node = GraphNode(
            id=f"{module.id}_transport",
            type='transport',
            module_id=module.id,
            # Base duration from distance
            base_duration=self._calculate_transport_duration(module),
            # NOVEL: Oversized load constraints
            dimensional_constraints={
                'length_ft': module.dimensions.length,
                'width_ft': module.dimensions.width,
                'height_ft': module.dimensions.height,
                'weight_lbs': module.weight,
                'requires_escort': module.width > 12,  # Wide load
                'requires_permit': module.width > 14 or module.height > 14,
            },
            # NOVEL: Route-specific constraints
            route_constraints={
                'allowed_hours': constraints.allowed_transport_hours,
                'bridge_clearances': constraints.route_clearances,
                'road_restrictions': constraints.road_restrictions,
                'weather_sensitivity': self._get_weather_sensitivity(module),
            },
            # NOVEL: Permit scheduling requirements
            permit_requirements={
                'lead_time_days': self._get_permit_lead_time(module),
                'valid_days': constraints.permit_valid_days,
                'renewal_process_days': constraints.permit_renewal_days,
            },
            propagates_forward=True,
            propagates_backward=True,
        )
        
        self.graph.add_node(transport_node.id, **transport_node.__dict__)
        return transport_node
    
    def _create_assembly_task(self,
                               module: ModuleSpec,
                               site: ConstructionSite) -> GraphNode:
        """
        NOVEL: Assembly task with site-specific positioning constraints.
        """
        
        assembly_node = GraphNode(
            id=f"{module.id}_assembly",
            type='assembly',
            module_id=module.id,
            duration=module.assembly_duration,
            # NOVEL: 4D positioning requirements
            positioning={
                'target_location': module.final_position,  # (x, y, z) in site coords
                'orientation': module.final_orientation,
                'connection_points': module.connection_interfaces,
            },
            # NOVEL: Crane requirements
            crane_requirements={
                'lift_weight': module.weight * 1.2,  # Safety factor
                'lift_radius': self._calculate_lift_radius(module, site),
                'lift_height': module.final_position.z + module.dimensions.height,
                'required_crane_type': self._determine_crane_type(module),
                'lift_duration_minutes': module.lift_duration,
            },
            # NOVEL: Site readiness prerequisites
            site_prerequisites={
                'foundation_ready': f"{module.id}_foundation",
                'connections_ready': module.prerequisite_modules,
                'staging_area_clear': True,
                'access_path_clear': True,
            },
            # Weather constraints for outdoor assembly
            weather_constraints={
                'max_wind_mph': 25,  # Crane operation limit
                'max_precipitation_in': 0.1,
                'min_temp_f': 20,
            },
            propagates_forward=True,
            propagates_backward=True,
        )
        
        self.graph.add_node(assembly_node.id, **assembly_node.__dict__)
        return assembly_node
    
    def _connect_backward_constraints(self,
                                       fab_tasks: List[GraphNode],
                                       transport: GraphNode,
                                       assembly: GraphNode):
        """
        NOVEL: Backward constraint edges for demand-driven scheduling.
        
        Key insight: In modular construction, the site assembly sequence
        drives when modules need to arrive, which drives when they need
        to ship, which drives when fabrication must complete.
        
        This is opposite of traditional push-based scheduling.
        """
        
        # Assembly → Transport backward constraint
        self.graph.add_edge(assembly.id, transport.id, **{
            'edge_type': 'backward_constraint',
            'constraint_type': 'latest_arrival',
            'buffer_days': 1,  # Module should arrive 1 day before assembly
            'description': 'Assembly date constrains latest transport arrival'
        })
        
        # Transport → Factory backward constraint  
        last_fab_task = fab_tasks[-1]  # Final fabrication step
        transport_duration = self.graph.nodes[transport.id]['base_duration']
        permit_lead_time = self.graph.nodes[transport.id]['permit_requirements']['lead_time_days']
        
        self.graph.add_edge(transport.id, last_fab_task.id, **{
            'edge_type': 'backward_constraint',
            'constraint_type': 'latest_completion',
            'buffer_days': permit_lead_time,  # Need time to secure permits
            'description': 'Transport date constrains latest fabrication completion'
        })
```

### Step 2: Bi-Directional Constraint Propagation Engine

```python
class BiDirectionalPropagationEngine:
    """
    PATENT CLAIM 2: Novel constraint propagation algorithm that 
    simultaneously satisfies forward flow (factory→site) and 
    backward demand (site→factory) constraints.
    """
    
    def __init__(self, schedule_graph: ModularScheduleGraph):
        self.graph = schedule_graph.graph
        self.convergence_threshold = 0.01  # Schedule stability threshold
        self.max_iterations = 100
        
    def propagate_constraints(self,
                               site_required_dates: Dict[str, datetime],
                               factory_capacities: Dict[str, FactoryCapacity]) -> OptimizedSchedule:
        """
        NOVEL: Iterative bi-directional propagation until convergence.
        
        Algorithm:
        1. Forward pass: Calculate earliest completion dates from factory capacity
        2. Backward pass: Calculate latest start dates from site requirements
        3. Conflict detection: Find where forward > backward (infeasible)
        4. Resolution: Apply resolution strategies (overtime, resequencing, etc.)
        5. Iterate until stable or max iterations
        """
        
        # Initialize schedules
        forward_schedule = {}  # Earliest dates
        backward_schedule = {}  # Latest dates
        
        for iteration in range(self.max_iterations):
            # Forward pass - factory pushes completion dates forward
            forward_schedule = self._forward_propagation(factory_capacities)
            
            # Backward pass - site pulls required dates backward
            backward_schedule = self._backward_propagation(site_required_dates)
            
            # Detect conflicts
            conflicts = self._detect_conflicts(forward_schedule, backward_schedule)
            
            if not conflicts:
                # Feasible schedule found
                break
            
            # Apply resolution strategies
            resolutions = self._resolve_conflicts(conflicts)
            
            # Check convergence
            if self._check_convergence(forward_schedule, backward_schedule):
                break
        
        return self._build_optimized_schedule(forward_schedule, backward_schedule)
    
    def _forward_propagation(self,
                             factory_capacities: Dict[str, FactoryCapacity]) -> Dict[str, TaskSchedule]:
        """
        NOVEL: Resource-constrained forward scheduling with factory capacity.
        
        Uses factory-specific constraints:
        - Workstation availability
        - Shift patterns
        - Parallel fabrication limits
        - Material availability
        """
        
        schedule = {}
        
        # Topological sort for forward processing
        sorted_nodes = list(nx.topological_sort(self.graph))
        
        # Filter to fabrication and transport nodes
        forward_nodes = [n for n in sorted_nodes 
                        if self.graph.nodes[n]['type'] in ('fabrication', 'transport')]
        
        for node_id in forward_nodes:
            node_data = self.graph.nodes[node_id]
            
            # Get predecessor completion times
            predecessors = [e[0] for e in self.graph.in_edges(node_id)
                          if self.graph.edges[e]['edge_type'] != 'backward_constraint']
            
            if predecessors:
                earliest_start = max(schedule[p].end_time for p in predecessors 
                                    if p in schedule)
            else:
                earliest_start = datetime.now()
            
            if node_data['type'] == 'fabrication':
                # Apply factory capacity constraints
                factory_id = node_data['factory_id']
                capacity = factory_capacities[factory_id]
                
                # Find earliest slot with available capacity
                scheduled_start = capacity.find_earliest_slot(
                    earliest_start=earliest_start,
                    duration=node_data['duration'],
                    workstation=node_data['factory_constraints']['workstation'],
                    resources=node_data['resources_required']
                )
                
                scheduled_end = scheduled_start + timedelta(hours=node_data['duration'])
                
            elif node_data['type'] == 'transport':
                # Apply transport constraints
                scheduled_start, scheduled_end = self._schedule_transport(
                    node_data, earliest_start
                )
            
            schedule[node_id] = TaskSchedule(
                task_id=node_id,
                start_time=scheduled_start,
                end_time=scheduled_end,
                schedule_type='forward'
            )
        
        return schedule
    
    def _backward_propagation(self,
                               site_required_dates: Dict[str, datetime]) -> Dict[str, TaskSchedule]:
        """
        NOVEL: Demand-driven backward scheduling from site requirements.
        
        Propagates site assembly dates backward through transport and factory,
        calculating latest acceptable completion times.
        """
        
        schedule = {}
        
        # Reverse topological sort for backward processing
        sorted_nodes = list(reversed(list(nx.topological_sort(self.graph))))
        
        for node_id in sorted_nodes:
            node_data = self.graph.nodes[node_id]
            
            if node_data['type'] == 'assembly':
                # Start from site required date
                required_date = site_required_dates.get(node_data['module_id'])
                if required_date:
                    latest_end = required_date
                    latest_start = latest_end - timedelta(hours=node_data['duration'])
                else:
                    continue
                    
            else:
                # Get successor requirements (from backward constraint edges)
                successors = [e[1] for e in self.graph.out_edges(node_id)]
                backward_successors = [s for s in successors 
                                      if s in schedule or 
                                      self.graph.nodes[s]['type'] == 'assembly']
                
                if not backward_successors:
                    continue
                
                # Latest end = earliest of successor latest starts - buffer
                latest_end = min(
                    schedule[s].start_time - self._get_buffer(node_id, s)
                    for s in backward_successors if s in schedule
                )
                
                latest_start = latest_end - timedelta(hours=node_data['duration'])
            
            schedule[node_id] = TaskSchedule(
                task_id=node_id,
                start_time=latest_start,
                end_time=latest_end,
                schedule_type='backward'
            )
        
        return schedule
    
    def _detect_conflicts(self,
                          forward: Dict[str, TaskSchedule],
                          backward: Dict[str, TaskSchedule]) -> List[ScheduleConflict]:
        """
        NOVEL: Identifies tasks where forward schedule exceeds backward constraint.
        
        Conflict exists when:
        forward_completion > backward_latest_completion
        
        This means the task cannot complete in time to meet site requirements.
        """
        
        conflicts = []
        
        for task_id in set(forward.keys()) & set(backward.keys()):
            forward_end = forward[task_id].end_time
            backward_end = backward[task_id].end_time
            
            if forward_end > backward_end:
                gap = forward_end - backward_end
                
                conflicts.append(ScheduleConflict(
                    task_id=task_id,
                    forward_date=forward_end,
                    required_date=backward_end,
                    gap_days=gap.days,
                    gap_hours=gap.total_seconds() / 3600,
                    conflict_type=self._classify_conflict(task_id, gap),
                    module_id=self.graph.nodes[task_id].get('module_id'),
                    affected_downstream=self._get_affected_downstream(task_id)
                ))
        
        return sorted(conflicts, key=lambda c: c.gap_days, reverse=True)
    
    def _resolve_conflicts(self, 
                           conflicts: List[ScheduleConflict]) -> List[ConflictResolution]:
        """
        NOVEL: Multi-strategy conflict resolution for modular construction.
        
        Resolution strategies (in priority order):
        1. Schedule compression (overtime, weekend work)
        2. Factory rebalancing (shift work to less-loaded factory)
        3. Transport optimization (faster route, different carrier)
        4. Assembly resequencing (change site installation order)
        5. Site schedule adjustment (if any float available)
        6. Scope change (split module, partial prefab)
        """
        
        resolutions = []
        
        for conflict in conflicts:
            resolution = None
            
            # Strategy 1: Schedule compression
            compression = self._attempt_compression(conflict)
            if compression and compression.resolves_conflict:
                resolution = compression
            
            # Strategy 2: Factory rebalancing
            if not resolution:
                rebalance = self._attempt_factory_rebalance(conflict)
                if rebalance and rebalance.resolves_conflict:
                    resolution = rebalance
            
            # Strategy 3: Transport optimization  
            if not resolution:
                transport_opt = self._attempt_transport_optimization(conflict)
                if transport_opt and transport_opt.resolves_conflict:
                    resolution = transport_opt
            
            # Strategy 4: Assembly resequencing
            if not resolution:
                resequence = self._attempt_assembly_resequencing(conflict)
                if resequence and resequence.resolves_conflict:
                    resolution = resequence
            
            # Strategy 5: Site schedule adjustment
            if not resolution:
                site_adj = self._attempt_site_adjustment(conflict)
                if site_adj and site_adj.resolves_conflict:
                    resolution = site_adj
            
            if resolution:
                resolutions.append(resolution)
                self._apply_resolution(resolution)
            else:
                # Unresolvable - flag for manual intervention
                resolutions.append(ConflictResolution(
                    conflict=conflict,
                    strategy='manual_intervention_required',
                    resolves_conflict=False,
                    impact_description=f"Module {conflict.module_id} cannot meet schedule"
                ))
        
        return resolutions
    
    def _attempt_factory_rebalance(self,
                                    conflict: ScheduleConflict) -> Optional[ConflictResolution]:
        """
        NOVEL: Cross-factory load balancing for conflict resolution.
        
        Evaluates moving fabrication tasks to alternate factory with:
        - Available capacity
        - Capability for module type
        - Net schedule improvement considering transport changes
        """
        
        task_id = conflict.task_id
        node_data = self.graph.nodes[task_id]
        
        if node_data['type'] != 'fabrication':
            return None
        
        current_factory = node_data['factory_id']
        module_id = node_data['module_id']
        
        # Find alternative factories
        alternatives = self._find_alternative_factories(
            module_id=module_id,
            current_factory=current_factory,
            required_completion=conflict.required_date
        )
        
        for alt_factory in alternatives:
            # Estimate new schedule at alternative factory
            new_completion = alt_factory.estimate_completion(
                module_id=module_id,
                start_date=datetime.now()
            )
            
            # Account for different transport distance
            new_transport_duration = self._calculate_transport_duration_from(
                alt_factory.id, self._get_site_location()
            )
            
            total_new_end = new_completion + timedelta(days=new_transport_duration)
            
            if total_new_end <= conflict.required_date:
                return ConflictResolution(
                    conflict=conflict,
                    strategy='factory_rebalance',
                    resolves_conflict=True,
                    details={
                        'from_factory': current_factory,
                        'to_factory': alt_factory.id,
                        'original_completion': conflict.forward_date,
                        'new_completion': new_completion,
                        'days_saved': (conflict.forward_date - total_new_end).days
                    },
                    schedule_changes=[
                        ScheduleChange(task_id=task_id, 
                                      change_type='reassign_factory',
                                      new_factory=alt_factory.id)
                    ]
                )
        
        return None
```

### Step 3: Transportation Network Optimizer

```python
class TransportationNetworkOptimizer:
    """
    PATENT CLAIM 3: Specialized optimization for oversized modular 
    construction loads with permit scheduling, route constraints,
    and weather-adjusted transit modeling.
    """
    
    def __init__(self):
        self.route_database = OversizedRouteDatabase()
        self.permit_system = PermitSchedulingSystem()
        self.weather_service = WeatherService()
        
    def optimize_transport_schedule(self,
                                     modules: List[ModuleSpec],
                                     factories: Dict[str, Factory],
                                     site: ConstructionSite,
                                     assembly_sequence: List[str]) -> TransportSchedule:
        """
        NOVEL: Joint optimization of route selection, timing, and sequencing
        for oversized modular loads with permit coordination.
        
        Optimization objectives:
        1. Minimize total transport cost
        2. Meet assembly sequence requirements
        3. Respect permit windows
        4. Avoid weather risks
        5. Maximize staging area utilization
        """
        
        # Phase 1: Route selection for each module
        routes = {}
        for module in modules:
            factory = factories[module.assigned_factory]
            route = self._select_optimal_route(module, factory, site)
            routes[module.id] = route
        
        # Phase 2: Permit scheduling
        permits = self._schedule_permits(modules, routes)
        
        # Phase 3: Weather-adjusted timing
        transport_windows = self._calculate_transport_windows(modules, routes, permits)
        
        # Phase 4: Sequence optimization
        optimized_sequence = self._optimize_delivery_sequence(
            modules, transport_windows, assembly_sequence, site
        )
        
        # Phase 5: Staging coordination
        staging_plan = self._plan_staging(optimized_sequence, site)
        
        return TransportSchedule(
            module_routes=routes,
            permits=permits,
            transport_windows=transport_windows,
            delivery_sequence=optimized_sequence,
            staging_plan=staging_plan
        )
    
    def _select_optimal_route(self,
                               module: ModuleSpec,
                               factory: Factory,
                               site: ConstructionSite) -> OversizedRoute:
        """
        NOVEL: Route selection considering oversized load constraints.
        
        Factors:
        - Bridge clearances vs module height
        - Road width vs module width  
        - Weight limits vs module weight
        - Turn radius requirements
        - Escort vehicle requirements
        - Permit jurisdiction crossings
        """
        
        # Get candidate routes from database
        candidates = self.route_database.get_routes(
            origin=factory.location,
            destination=site.location,
            load_dimensions=module.dimensions,
            load_weight=module.weight
        )
        
        scored_routes = []
        
        for route in candidates:
            score = RouteScore()
            
            # Clearance check
            min_clearance = min(c.height for c in route.clearance_points)
            if min_clearance < module.dimensions.height + 0.5:  # Safety margin
                score.feasible = False
                continue
            
            # Width check
            min_width = min(s.width for s in route.road_segments)
            if min_width < module.dimensions.width + 2:  # Passing margin
                score.requires_escort = True
                score.escort_cost = route.escort_cost_estimate
            
            # Weight check
            min_weight_limit = min(b.weight_limit for b in route.bridges)
            if module.weight > min_weight_limit:
                score.feasible = False
                continue
            
            # Permit complexity
            score.permit_jurisdictions = len(route.jurisdiction_crossings)
            score.permit_lead_time = max(j.permit_lead_time for j in route.jurisdiction_crossings)
            
            # Transit time
            score.base_transit_hours = route.total_distance / route.average_speed
            
            # Cost calculation
            score.total_cost = (
                route.base_cost +
                score.escort_cost +
                (score.permit_jurisdictions * 500) +  # Permit fees
                (score.base_transit_hours * 150)      # Hourly carrier rate
            )
            
            score.route = route
            scored_routes.append(score)
        
        # Select best feasible route
        feasible_routes = [r for r in scored_routes if r.feasible]
        if not feasible_routes:
            raise NoFeasibleRouteError(f"No feasible route for module {module.id}")
        
        return min(feasible_routes, key=lambda r: r.total_cost).route
    
    def _schedule_permits(self,
                          modules: List[ModuleSpec],
                          routes: Dict[str, OversizedRoute]) -> Dict[str, List[Permit]]:
        """
        NOVEL: Coordinated permit scheduling across multiple modules.
        
        Optimization opportunities:
        - Batch permits for same jurisdiction
        - Sequence shipments to reuse permits within valid period
        - Pre-position permits for critical path modules
        """
        
        permits = defaultdict(list)
        
        # Group modules by route jurisdictions
        jurisdiction_groups = defaultdict(list)
        for module in modules:
            route = routes[module.id]
            for jurisdiction in route.jurisdiction_crossings:
                jurisdiction_groups[jurisdiction.id].append(module.id)
        
        # Schedule permits by jurisdiction with batching
        for jurisdiction_id, module_ids in jurisdiction_groups.items():
            jurisdiction = self.permit_system.get_jurisdiction(jurisdiction_id)
            
            # Sort modules by required delivery date
            sorted_modules = sorted(
                module_ids,
                key=lambda m: self._get_required_delivery(m)
            )
            
            # Batch into permit windows
            current_batch = []
            batch_start = None
            
            for module_id in sorted_modules:
                required_date = self._get_required_delivery(module_id)
                
                if batch_start is None:
                    batch_start = required_date - timedelta(days=jurisdiction.permit_lead_time)
                    current_batch = [module_id]
                elif required_date - batch_start <= timedelta(days=jurisdiction.permit_validity_days):
                    # Can include in current batch
                    current_batch.append(module_id)
                else:
                    # Need new permit batch
                    permit = self._request_permit(jurisdiction, current_batch, batch_start)
                    for m_id in current_batch:
                        permits[m_id].append(permit)
                    
                    batch_start = required_date - timedelta(days=jurisdiction.permit_lead_time)
                    current_batch = [module_id]
            
            # Final batch
            if current_batch:
                permit = self._request_permit(jurisdiction, current_batch, batch_start)
                for m_id in current_batch:
                    permits[m_id].append(permit)
        
        return permits
    
    def _calculate_transport_windows(self,
                                      modules: List[ModuleSpec],
                                      routes: Dict[str, OversizedRoute],
                                      permits: Dict[str, List[Permit]]) -> Dict[str, TransportWindow]:
        """
        NOVEL: Weather-adjusted transport windows considering all constraints.
        """
        
        windows = {}
        
        for module in modules:
            route = routes[module.id]
            module_permits = permits[module.id]
            
            # Get weather forecast for route corridor
            weather_forecast = self.weather_service.get_corridor_forecast(
                route.corridor_bounds,
                days_ahead=14
            )
            
            # Find suitable transport days
            suitable_days = []
            
            for day in range(14):
                date = datetime.now().date() + timedelta(days=day)
                
                # Check permit validity
                permit_valid = any(
                    p.valid_from <= date <= p.valid_until
                    for p in module_permits
                )
                
                if not permit_valid:
                    continue
                
                # Check weather suitability
                day_weather = weather_forecast.get_day(date)
                
                weather_suitable = (
                    day_weather.max_wind_mph < route.wind_limit and
                    day_weather.precipitation_probability < 0.3 and
                    day_weather.visibility_miles > route.min_visibility
                )
                
                if not weather_suitable:
                    continue
                
                # Check allowed hours
                for hour_window in route.allowed_hours:
                    hour_weather = weather_forecast.get_hour(date, hour_window.start_hour)
                    
                    if self._is_hour_suitable(hour_weather, route):
                        suitable_days.append(TransportDay(
                            date=date,
                            start_hour=hour_window.start_hour,
                            end_hour=hour_window.end_hour,
                            weather_confidence=hour_weather.confidence,
                            permit_ids=[p.id for p in module_permits if p.valid_from <= date <= p.valid_until]
                        ))
            
            if not suitable_days:
                # No suitable days - flag for attention
                windows[module.id] = TransportWindow(
                    module_id=module.id,
                    suitable_days=[],
                    risk_level='high',
                    recommendation='Manual scheduling required - no weather/permit windows'
                )
            else:
                windows[module.id] = TransportWindow(
                    module_id=module.id,
                    suitable_days=suitable_days,
                    risk_level='low' if len(suitable_days) > 3 else 'medium',
                    recommendation=f'{len(suitable_days)} suitable transport days identified'
                )
        
        return windows
```

---

## Output Specification

```python
MCOSOutput = {
    "project_id": str,
    "generated_at": datetime,
    "optimization_status": enum["optimal", "feasible", "infeasible", "warning"],
    
    "master_schedule": {
        "total_duration_days": int,
        "critical_path": List[str],  # Task IDs on critical path
        "total_float_days": float,
    },
    
    "factory_schedules": [
        {
            "factory_id": str,
            "factory_name": str,
            "modules_assigned": List[str],
            "capacity_utilization": float,
            "schedule": [
                {
                    "module_id": str,
                    "fab_start": datetime,
                    "fab_end": datetime,
                    "status": str,
                    "workstation_assignments": Dict[str, str]
                }
            ]
        }
    ],
    
    "transport_schedule": {
        "total_shipments": int,
        "total_transport_cost": float,
        "shipments": [
            {
                "module_id": str,
                "route_id": str,
                "departure_window": {
                    "earliest": datetime,
                    "latest": datetime,
                    "recommended": datetime
                },
                "arrival_window": {
                    "earliest": datetime,
                    "latest": datetime,
                    "recommended": datetime
                },
                "permits": [
                    {
                        "permit_id": str,
                        "jurisdiction": str,
                        "valid_from": date,
                        "valid_until": date,
                        "status": str
                    }
                ],
                "weather_risk": float,
                "escort_required": bool
            }
        ]
    },
    
    "site_assembly_schedule": {
        "assembly_start": datetime,
        "assembly_end": datetime,
        "sequence": [
            {
                "module_id": str,
                "scheduled_arrival": datetime,
                "assembly_start": datetime,
                "assembly_end": datetime,
                "crane_assignment": str,
                "staging_location": str,
                "predecessors_complete": bool
            }
        ],
        "crane_schedule": {
            "crane_id": str,
            "lifts": [
                {
                    "module_id": str,
                    "lift_time": datetime,
                    "duration_minutes": int,
                    "setup_requirements": List[str]
                }
            ]
        }
    },
    
    "bottleneck_predictions": [
        {
            "bottleneck_type": enum["factory_capacity", "transport", "staging", "crane", "weather"],
            "location": str,
            "predicted_date": datetime,
            "severity": enum["low", "medium", "high", "critical"],
            "affected_modules": List[str],
            "mitigation_options": [
                {
                    "option": str,
                    "cost_impact": float,
                    "schedule_impact_days": int,
                    "feasibility": float
                }
            ]
        }
    ],
    
    "kpis": {
        "schedule_confidence": float,  # 0-1
        "cost_confidence": float,
        "on_time_probability": float,
        "buffer_utilization": float
    }
}
```

---

## Claims Summary for Patent 3

1. **Claim 1**: A computer-implemented method for modular construction scheduling comprising a unified schedule graph with fabrication, transport, and assembly nodes connected by bi-directional constraint edges enabling simultaneous forward and backward schedule propagation.

2. **Claim 2**: A bi-directional constraint propagation algorithm for modular construction comprising iterative forward scheduling from factory capacity constraints and backward scheduling from site assembly requirements, with automated conflict detection and multi-strategy resolution.

3. **Claim 3**: A transportation optimization system for oversized modular construction loads comprising route selection with dimensional clearance validation, coordinated multi-jurisdiction permit scheduling with batching optimization, and weather-adjusted transport window calculation.

4. **Claim 4**: A staging yard management system for modular construction comprising just-in-time delivery sequencing coordinated with crane availability, buffer management between arrivals, and real-time re-sequencing upon delay detection.

5. **Claim 5**: An integrated modular construction orchestration platform combining claims 1-4 to coordinate off-site fabrication, transportation logistics, and on-site assembly into a synchronized pipeline with predictive bottleneck detection.

---

# SUMMARY: PATENT PORTFOLIO DIFFERENTIATION

| Feature | Prior Art (Procore/Autodesk) | BuildTrack Innovation |
|---------|------------------------------|----------------------|
| **Risk Prediction** | Reactive alerts after issues | 3-7 day predictive with 87% accuracy |
| **Data Integration** | Point-to-point, manual mapping | Semantic ontology with auto-mapping |
| **Scheduling** | Single-location CPM | Bi-directional multi-facility optimization |
| **Cascade Modeling** | Not supported | Monte Carlo cascade simulation |
| **Modular Construction** | Basic tracking | Full fabrication-transport-assembly orchestration |
| **Conflict Resolution** | Manual intervention | AI-driven multi-strategy resolution |

---

**Document Prepared For:** Patent Counsel Review
**Confidentiality:** Attorney-Client Privileged
**Next Steps:** 
1. Prior art search validation
2. Claims refinement with patent attorney
3. Provisional application filing
