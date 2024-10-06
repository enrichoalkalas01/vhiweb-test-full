pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {
        stage('Checkout') {
            steps {
                // Ambil kode dari repository
                checkout scm
            }
        }

        stage('Build Frontend and Backend') {
            steps {
                script {
                    // Build ulang Docker images untuk frontend dan backend
                    sh 'docker-compose -f $DOCKER_COMPOSE_FILE build frontend backend'
                }
            }
        }

        stage('Deploy Containers') {
            steps {
                script {
                    // Hentikan container yang sedang berjalan
                    sh 'docker-compose -f $DOCKER_COMPOSE_FILE down'

                    // Jalankan ulang container dalam mode detached (-d)
                    sh 'docker-compose -f $DOCKER_COMPOSE_FILE up -d frontend backend'
                }
            }
        }

        stage('Cleanup') {
            steps {
                script {
                    // Hapus image Docker yang tidak digunakan untuk menjaga kebersihan sistem
                    sh 'docker system prune -f'
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment berhasil!'
        }
        failure {
            echo 'Deployment gagal!'
        }
    }
}