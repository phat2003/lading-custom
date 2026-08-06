package service

import (
	"github.com/google/uuid"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

type ProjectService struct {
	projectRepo *repository.ProjectRepository
}

func NewProjectService(projectRepo *repository.ProjectRepository) *ProjectService {
	return &ProjectService{projectRepo: projectRepo}
}

func (s *ProjectService) CreateProject(name string, ownerID uuid.UUID) (*models.Project, error) {
	project := &models.Project{
		Name:    name,
		OwnerID: ownerID,
	}
	if err := s.projectRepo.Create(project); err != nil {
		return nil, err
	}
	return project, nil
}

func (s *ProjectService) GetUserProjects(ownerID uuid.UUID) ([]models.Project, error) {
	return s.projectRepo.FindAllByOwnerID(ownerID)
}

func (s *ProjectService) GetProjectByID(id, ownerID uuid.UUID) (*models.Project, error) {
	return s.projectRepo.FindByIDAndOwnerID(id, ownerID)
}

func (s *ProjectService) UpdateProject(id, ownerID uuid.UUID, newName string) (*models.Project, error) {
	project, err := s.projectRepo.FindByIDAndOwnerID(id, ownerID)
	if err != nil {
		return nil, err
	}

	project.Name = newName
	if err := s.projectRepo.Update(project); err != nil {
		return nil, err
	}

	return project, nil
}

func (s *ProjectService) DeleteProject(id, ownerID uuid.UUID) error {
	project, err := s.projectRepo.FindByIDAndOwnerID(id, ownerID)
	if err != nil {
		return err
	}
	return s.projectRepo.Delete(project)
}
