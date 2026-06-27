use axum::{
    routing::{get, post},
    Router,
    Json,
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
    version: String,
}

#[derive(Serialize)]
struct ApiResponse<T: Serialize> {
    success: bool,
    data: Option<T>,
    error: Option<String>,
}

#[derive(Serialize)]
struct SiteStatus {
    name: String,
    url: String,
    status: String,
    response_time_ms: u32,
    status_code: u32,
    last_checked: String,
    uptime_percentage: f32,
    incidents: Vec<Incident>,
}

#[derive(Serialize)]
struct Incident {
    id: String,
    title: String,
    status: String,
    started_at: String,
    duration_minutes: u32,
}

#[derive(Deserialize)]
struct CheckRequest {
    url: String,
}

async fn health_check() -> impl IntoResponse {
    Json(HealthResponse {
        status: "healthy".to_string(),
        service: "Check if any site is down".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

async fn root() -> impl IntoResponse {
    Json(ApiResponse::<()> {
        success: true,
        data: None,
        error: None,
    })
}

async fn check_site(Json(req): Json<CheckRequest>) -> impl IntoResponse {
    let status = SiteStatus {
        name: req.url.clone(),
        url: req.url.clone(),
        status: "operational".to_string(),
        response_time_ms: 145,
        status_code: 200,
        last_checked: chrono::Utc::now().to_rfc3339(),
        uptime_percentage: 99.98,
        incidents: vec![],
    };

    Json(ApiResponse {
        success: true,
        data: Some(status),
        error: None,
    })
}

async fn get_global_status() -> impl IntoResponse {
    let sites = vec![
        serde_json::json!({ "name": "Google", "status": "operational", "uptime": 99.99 }),
        serde_json::json!({ "name": "AWS", "status": "operational", "uptime": 99.95 }),
        serde_json::json!({ "name": "GitHub", "status": "operational", "uptime": 99.98 }),
        serde_json::json!({ "name": "Cloudflare", "status": "degraded", "uptime": 99.85 }),
    ];

    Json(ApiResponse {
        success: true,
        data: Some(serde_json::json!({
            "overall_status": "operational",
            "services": sites,
            "last_updated": chrono::Utc::now().to_rfc3339()
        })),
        error: None,
    })
}

async fn get_incidents() -> impl IntoResponse {
    let incidents = vec![
        serde_json::json!({
            "id": "inc-001",
            "service": "Cloudflare",
            "title": "Elevated error rates",
            "status": "investigating",
            "started_at": "2024-03-20T10:30:00Z"
        }),
    ];

    Json(ApiResponse {
        success: true,
        data: Some(incidents),
        error: None,
    })
}

async fn get_stats() -> impl IntoResponse {
    Json(ApiResponse {
        success: true,
        data: Some(serde_json::json!({
            "total_checks": 89012345,
            "sites_monitored": 12345,
            "incidents_today": 23,
            "avg_response_time_ms": 234
        })),
        error: None,
    })
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health_check))
        .route("/api/check", post(check_site))
        .route("/api/global", get(get_global_status))
        .route("/api/incidents", get(get_incidents))
        .route("/api/stats", get(get_stats))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .unwrap();

    tracing::info!("Check if any site is down backend running on port 3001");
    axum::serve(listener, app).await.unwrap();
}
