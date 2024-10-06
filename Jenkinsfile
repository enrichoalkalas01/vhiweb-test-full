pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {
        stage('Verify Git Installation') {
            steps {
                sh 'git --version'
            }
        }

        stage('Git Checkout Master Branch') {
            steps {
                sh 'git fetch --all'
                sh 'git checkout master'
            }
        }

        stage('Pulling The Newest Code') {
            steps {
                sh 'git pull origin master'
            }
        }

        stage('Check Changes in Frontend and Backend') {
            steps {
                script {
                    // Check if frontend or backend directories have changed
                    def frontendChanged = sh(script: "git diff --name-only HEAD^ | grep '^frontend/' || true", returnStatus: true) == 0
                    def backendChanged = sh(script: "git diff --name-only HEAD^ | grep '^backend/' || true", returnStatus: true) == 0

                    if (frontendChanged || backendChanged) {
                        echo 'Changes detected in frontend or backend, rebuilding services...'
                    } else {
                        echo 'No changes detected in frontend or backend, skipping rebuild...'
                    }

                    // Set environment variables based on what changed
                    if (frontendChanged) {
                        env.REBUILD_FRONTEND = 'true'
                    }
                    if (backendChanged) {
                        env.REBUILD_BACKEND = 'true'
                    }
                }
            }
        }

        stage('Build and Deploy Containers') {
            steps {
                script {
                    // Rebuild frontend if there were changes
                    if (env.REBUILD_FRONTEND == 'true') {
                        sh 'docker-compose -f $DOCKER_COMPOSE_FILE build frontend'
                    }

                    // Rebuild backend if there were changes
                    if (env.REBUILD_BACKEND == 'true') {
                        sh 'docker-compose -f $DOCKER_COMPOSE_FILE build backend'
                    }

                    // Deploy containers regardless of changes
                    sh 'docker-compose -f $DOCKER_COMPOSE_FILE up -d frontend backend'
                }
            }
        }

        stage('Cleanup') {
            steps {
                script {
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
